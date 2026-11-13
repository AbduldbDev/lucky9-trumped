-- Trump Shop: chip-priced bundles of random Trump Cards.
--
-- Design:
--   * `trump_shop_items` is the SERVER-SIDE source of truth for prices and
--     quantities. The purchase RPC never trusts client-submitted prices.
--     Keep the seed rows in sync with src/config/trumpShop.config.js.
--   * `purchase_trump_bundle` atomically validates the bundle, locks the
--     buyer's profile row, checks chips, deducts once, and writes an audit
--     row. It never leaves a negative balance (profiles.chips has CHECK >= 0).
--   * The room HOST later consumes the audit row via
--     `verify_trump_purchase` (exactly-once) before granting the rolled cards
--     into the match inventory, so chips can never be deducted without a
--     corresponding in-game grant (except if the host vanishes mid-flight).

-- ── Shop catalogue ──────────────────────────────────────────────────────────
create table if not exists public.trump_shop_items (
    bundle_id  text primary key,
    name       text    not null,
    quantity   int     not null check (quantity between 1 and 20),
    price      int     not null check (price >= 0),
    active     boolean not null default true,
    sort_order int     not null default 0
);

insert into public.trump_shop_items (bundle_id, name, quantity, price, sort_order)
values
    ('starter', 'Starter', 1, 150, 1),
    ('duo',     'Duo',     2, 280, 2),
    ('value',   'Value',   5, 650, 3),
    ('mega',    'Mega',    7, 850, 4)
on conflict (bundle_id) do update
    set name       = excluded.name,
        quantity   = excluded.quantity,
        price      = excluded.price,
        sort_order = excluded.sort_order,
        active     = true;

-- ── Purchase audit trail ────────────────────────────────────────────────────
create table if not exists public.trump_purchases (
    purchase_id uuid        primary key default gen_random_uuid(),
    user_id     uuid        not null references public.profiles (id) on delete cascade,
    party_code  text,
    bundle_id   text        not null references public.trump_shop_items (bundle_id),
    quantity    int         not null,
    price       int         not null,
    consumed    boolean     not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists trump_purchases_user_idx
    on public.trump_purchases (user_id, created_at desc);

-- RLS: buyers may read only their own receipts; all writes go through the
-- SECURITY DEFINER functions below (no direct insert/update policies).
alter table public.trump_purchases enable row level security;

drop policy if exists "read own trump purchases" on public.trump_purchases;
create policy "read own trump purchases"
    on public.trump_purchases for select to authenticated
    using (user_id = auth.uid());

-- ── Purchase: validate + deduct + audit (atomic) ────────────────────────────
create or replace function public.purchase_trump_bundle(
    p_bundle_id  text,
    p_party_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_item     record;
    v_chips    int;
    v_purchase uuid;
begin
    select * into v_item
    from public.trump_shop_items
    where bundle_id = p_bundle_id and active
    for update;

    if v_item is null then
        raise exception 'UNKNOWN_BUNDLE';
    end if;

    select chips into v_chips
    from public.profiles
    where id = auth.uid()
    for update;

    if v_chips is null then
        raise exception 'NO_PROFILE';
    end if;

    if v_chips < v_item.price then
        raise exception 'INSUFFICIENT_CHIPS';
    end if;

    update public.profiles
    set chips = chips - v_item.price
    where id = auth.uid()
    returning chips into v_chips;

    insert into public.trump_purchases (user_id, party_code, bundle_id, quantity, price)
    values (auth.uid(), p_party_code, v_item.bundle_id, v_item.quantity, v_item.price)
    returning purchase_id into v_purchase;

    return jsonb_build_object(
        'ok',             true,
        'purchase_id',    v_purchase,
        'bundle_id',      v_item.bundle_id,
        'quantity',       v_item.quantity,
        'price',          v_item.price,
        'chips_remaining', v_chips
    );
end;
$$;

-- ── Verify (host): consume a purchase exactly once ──────────────────────────
create or replace function public.verify_trump_purchase(
    p_purchase_id uuid,
    p_user_id     uuid,
    p_party_code  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_row public.trump_purchases%rowtype;
begin
    select * into v_row
    from public.trump_purchases
    where purchase_id = p_purchase_id
    for update;

    if v_row is null then
        return jsonb_build_object('ok', false, 'reason', 'NOT_FOUND');
    end if;
    if v_row.consumed then
        return jsonb_build_object('ok', false, 'reason', 'ALREADY_CONSUMED');
    end if;
    if v_row.user_id <> p_user_id then
        return jsonb_build_object('ok', false, 'reason', 'USER_MISMATCH');
    end if;
    if coalesce(p_party_code, '') <> coalesce(v_row.party_code, '') then
        return jsonb_build_object('ok', false, 'reason', 'ROOM_MISMATCH');
    end if;

    update public.trump_purchases
    set consumed = true
    where purchase_id = p_purchase_id;

    return jsonb_build_object(
        'ok',       true,
        'quantity', v_row.quantity,
        'price',    v_row.price
    );
end;
$$;

grant execute on function public.purchase_trump_bundle(text, text) to authenticated;
grant execute on function public.verify_trump_purchase(uuid, uuid, text) to authenticated;
