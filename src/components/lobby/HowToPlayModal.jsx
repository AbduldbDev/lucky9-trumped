import { useState } from "react";

/**
 * Mobile-first sizing: base classes are compact, `sm:` restores roomier sizes.
 * Content and tab logic are unchanged; only the presentation is restyled.
 */

// Rarity colours match RARITY_COLOR in trumpCards.config.js
const RARITY_HEX = {
  COMMON: "#9ca3af",
  UNCOMMON: "#22c55e",
  RARE: "#3b82f6",
  LEGENDARY: "#eab308",
  MYTHIC: "#a855f7",
};

const BODY = "text-[11px] leading-relaxed text-ivory-dim/70 sm:text-[13px]";

export default function HowToPlayModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("basics");

  if (!isOpen) return null;

  const tabs = [
    { id: "basics", label: "Basics", icon: "fa-play" },
    { id: "gameplay", label: "Gameplay", icon: "fa-gamepad" },
    { id: "trumps", label: "Trump Cards", icon: "fa-wand-magic-sparkles" },
    { id: "winning", label: "Winning", icon: "fa-trophy" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to play"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative mx-3 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden
          rounded-xl border border-gold/25 bg-ink/95 animate-fadeUp sm:mx-4 sm:rounded-2xl"
        style={{
          boxShadow:
            "0 30px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top hairline accent */}
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {/* Header */}
        <div className="flex flex-none items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.06] sm:h-10 sm:w-10">
              <i className="fa-solid fa-book-open text-xs text-gold-light sm:text-sm" />
            </div>
            <div>
              <span className="text-[8px] font-medium uppercase tracking-[0.3em] text-gold/80 sm:text-[9px]">
                Guide
              </span>
              <h2 className="font-serif text-sm font-medium leading-tight tracking-wide text-ivory sm:text-lg">
                How to Play Lucky 9
              </h2>
              <p className="mt-0.5 text-[9px] text-ivory-dim/50 sm:text-[11px]">
                Master the card game with Trump Card twists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 transition-colors
              hover:bg-white/5 hover:text-white/80
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          className="flex-none border-b border-white/[0.06] px-2 sm:px-4"
        >
          <div className="no-scrollbar flex gap-1 overflow-x-auto sm:gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[9px]
                    font-medium uppercase tracking-[0.2em] transition-colors duration-200
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
                    sm:gap-2 sm:px-4 sm:py-3 sm:text-[10px]
                    ${
                      active
                        ? "text-gold-light"
                        : "text-ivory-dim/50 hover:text-ivory-dim/90"
                    }`}
                >
                  <i
                    className={`fa-solid ${tab.icon} text-[9px] sm:text-[10px]`}
                  />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-light to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
          {activeTab === "basics" && <BasicsTab />}
          {activeTab === "gameplay" && <GameplayTab />}
          {activeTab === "trumps" && <TrumpsTab />}
          {activeTab === "winning" && <WinningTab />}
        </div>

        {/* Footer */}
        <div className="flex flex-none items-center justify-between border-t border-white/[0.06] px-4 py-2.5 sm:px-6 sm:py-3">
          <span className="text-[9px] tracking-wide text-ivory-dim/40 sm:text-[10px]">
            Scroll for more info
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-gold-light/50 bg-gradient-to-b from-gold/25 to-gold/10
              px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-light
              transition-all duration-200 hover:border-gold-light/80 hover:from-gold/35
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60
              active:scale-[0.98] sm:py-2 sm:text-[11px]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Tabs ------------------------------ */

function BasicsTab() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Section icon="fa-bullseye" title="Objective">
        <p className={BODY}>
          Get as close to <B>9</B> as possible! Your hand value is calculated{" "}
          <B>mod 10</B> (sum of card values, last digit only).
        </p>
        <Panel className="mt-2.5">
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[10px]">
            Example
          </p>
          <p className="text-[11px] text-ivory/80 sm:text-[13px]">
            <span className="text-gold">7♠ + 8♥ = 15</span> → Hand value ={" "}
            <B>5</B>
          </p>
          <p className="mt-0.5 text-[11px] text-ivory/80 sm:text-[13px]">
            <span className="text-gold">9♦ + K♣ = 9</span> → Hand value ={" "}
            <B>9</B> (Perfect!)
          </p>
        </Panel>
      </Section>

      <Section icon="fa-clone" title="Card Values">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Panel className="text-center">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.15em] text-gold sm:text-[10px]">
              Ace
            </div>
            <div className="font-serif text-lg text-ivory sm:text-2xl">1</div>
          </Panel>
          <Panel className="text-center">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.15em] text-gold sm:text-[10px]">
              2–9
            </div>
            <div className="text-[11px] leading-tight text-ivory sm:text-base">
              Face value
            </div>
          </Panel>
          <Panel className="text-center">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-[0.15em] text-gold sm:text-[10px]">
              10 J Q K
            </div>
            <div className="font-serif text-lg text-ivory sm:text-2xl">0</div>
          </Panel>
        </div>
      </Section>

      <Section icon="fa-heart" title="Lives System">
        <p className={BODY}>
          Everyone starts with <B>12 lives</B> (♥). Lose a round? You lose lives
          equal to the current bet. Run out of lives and you're eliminated!
        </p>
      </Section>

      <Section icon="fa-users" title="Players">
        <p className={BODY}>
          <B>2-6 players</B> compete in private rooms. Last player standing wins
          the match!
        </p>
      </Section>
    </div>
  );
}

function GameplayTab() {
  const steps = [
    <>
      Each player starts with <B>1 face-down card</B> (hole card) +{" "}
      <B>1 face-up card</B>
    </>,
    <>
      On your turn, choose to <B>Hit</B> (draw) or <B>Stand</B> (lock hand)
    </>,
    <>
      You can hold up to <B>5 cards</B> maximum in your hand
    </>,
    <>
      Once all players stand, there's a <B>showdown</B> to reveal the winner
    </>,
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <Section icon="fa-rotate" title="Turn Order">
        <ol className="space-y-2.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 flex-none items-center justify-center rounded-full border
                  border-gold/40 bg-gold/[0.06] font-mono text-[9px] text-gold-light sm:h-6 sm:w-6 sm:text-[10px]"
              >
                {i + 1}
              </span>
              <span className={`${BODY} pt-px`}>{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon="fa-hand" title="Your Actions">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <Panel>
            <div className="mb-1.5 flex items-center gap-2">
              <i className="fa-solid fa-plus text-[9px] text-gold/80 sm:text-[10px]" />
              <strong className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory sm:text-[11px]">
                Hit
              </strong>
            </div>
            <p className="text-[10px] leading-relaxed text-ivory-dim/60 sm:text-xs">
              Draw another card. Use this to get closer to 9, but risk going
              over!
            </p>
          </Panel>
          <Panel accent>
            <div className="mb-1.5 flex items-center gap-2">
              <i className="fa-solid fa-hand text-[9px] text-gold-light sm:text-[10px]" />
              <strong className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-light sm:text-[11px]">
                Stand
              </strong>
            </div>
            <p className="text-[10px] leading-relaxed text-ivory-dim/60 sm:text-xs">
              Lock your hand. You won't draw again this round. Use when
              satisfied with your total.
            </p>
          </Panel>
        </div>
      </Section>

      <Section icon="fa-clock" title="Timer">
        <p className={BODY}>
          You have <B>30 seconds</B> per turn. When time gets low, you'll hear a
          heartbeat warning. Run out of time and you're eliminated for the
          round!
        </p>
      </Section>

      <Section icon="fa-coins" title="Betting">
        <p className={BODY}>
          The bet starts at <B>1 life</B> per round. Trump cards can increase or
          decrease the bet, making rounds more intense!
        </p>
      </Section>
    </div>
  );
}

function TrumpsTab() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Section icon="fa-wand-magic-sparkles" title="Trump Cards">
        <p className={`${BODY} mb-3`}>
          Trump cards are <B>special powers</B> that can change the game! Each
          player starts with <B>2 trump cards</B> and draws{" "}
          <B>1 more after each round</B>.
        </p>
        <Panel accent>
          <p className="mb-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold sm:text-[10px]">
            <i className="fa-solid fa-lightbulb mr-1.5" />
            Bonus Trump Card
          </p>
          <p className={BODY}>
            Hit exactly <B>9</B> during a round to earn a bonus trump card!
          </p>
        </Panel>
      </Section>

      <Section icon="fa-gem" title="Rarity System">
        <div className="space-y-1.5">
          <RarityBadge rarity="Common" id="COMMON" chance="45%" />
          <RarityBadge rarity="Uncommon" id="UNCOMMON" chance="27%" />
          <RarityBadge rarity="Rare" id="RARE" chance="17%" />
          <RarityBadge rarity="Legendary" id="LEGENDARY" chance="8%" />
          <RarityBadge rarity="Mythic" id="MYTHIC" chance="3%" />
        </div>
      </Section>

      <Section icon="fa-list" title="Example Trump Cards">
        <div className="space-y-2">
          <TrumpExample
            name="Double Down"
            rarity="COMMON"
            effect="Double the current bet"
          />
          <TrumpExample
            name="Peek"
            rarity="UNCOMMON"
            effect="View the next 3 cards in the deck"
          />
          <TrumpExample
            name="Hush"
            rarity="RARE"
            effect="Draw a card that opponents can't see"
          />
          <TrumpExample
            name="Shatter"
            rarity="LEGENDARY"
            effect="Counter another player's trump card"
          />
          <TrumpExample
            name="Angel Card"
            rarity="MYTHIC"
            effect="Protect yourself from elimination once"
          />
        </div>
        <Panel className="mt-3">
          <p className="text-[10px] text-ivory-dim/60 sm:text-xs">
            <i className="fa-solid fa-circle-info mr-1.5 text-gold/60" />
            Click the <i className="fa-solid fa-question mx-0.5 text-gold/70" />{" "}
            icon in-game to view all trump cards and their effects!
          </p>
        </Panel>
      </Section>
    </div>
  );
}

function WinningTab() {
  const tips = [
    <>
      <Tip>Stand on 7-9</Tip> unless you have a good reason to hit
    </>,
    <>
      <Tip>Use trump cards strategically</Tip> — they can turn the tide!
    </>,
    <>
      <Tip>Watch the bet</Tip> — high bets mean high risk/reward
    </>,
    <>
      <Tip>Count cards</Tip> if you can — knowing what's been played helps
    </>,
    <>
      <Tip>Save powerful trumps</Tip> for critical moments
    </>,
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <Section icon="fa-crown" title="Round Winner">
        <p className={`${BODY} mb-3`}>
          After all players stand, cards are revealed. The player with the{" "}
          <B>highest hand value</B> wins!
        </p>
        <div className="space-y-2">
          <Panel>
            <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[10px]">
              Tiebreaker 1
            </div>
            <p className={BODY}>
              If tied, player with <B>fewer cards</B> wins
            </p>
          </Panel>
          <Panel>
            <div className="mb-1 text-[9px] uppercase tracking-[0.2em] text-ivory-dim/50 sm:text-[10px]">
              Tiebreaker 2
            </div>
            <p className={BODY}>
              If still tied, it's a <B>draw</B> — no lives lost
            </p>
          </Panel>
        </div>
      </Section>

      <Section icon="fa-star" title="Natural 8 or 9">
        <p className={BODY}>
          A <B>"Natural"</B> is a 2-card hand totaling <B>8 or 9</B>. These are
          powerful starting hands tracked in your stats!
        </p>
      </Section>

      <Section icon="fa-trophy" title="Match Winner">
        <p className={`${BODY} mb-3`}>
          The last player standing (with lives remaining) <B>wins the match</B>!
        </p>
        <Panel accent>
          <div className="mb-1.5 flex items-center gap-2">
            <i className="fa-solid fa-coins text-xs text-gold-light sm:text-sm" />
            <strong className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory sm:text-[11px]">
              Rewards
            </strong>
          </div>
          <p className={BODY}>
            Winners earn <B>100-120 chips</B> that can be used in the shop to
            unlock new card skins!
          </p>
        </Panel>
      </Section>

      <Section icon="fa-repeat" title="Rematch">
        <p className={BODY}>
          After a match ends, all players can vote for a <B>rematch</B>. If
          everyone agrees, you'll play again with the same group!
        </p>
      </Section>

      <Section icon="fa-graduation-cap" title="Pro Tips">
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <i className="fa-solid fa-lightbulb mt-0.5 text-[9px] text-gold/70 sm:text-[10px]" />
              <span className={BODY}>{tip}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

/* ------------------------- Helper components ------------------------- */

// Inline emphasis
function B({ children }) {
  return <strong className="font-medium text-gold-light">{children}</strong>;
}

function Tip({ children }) {
  return <strong className="font-medium text-ivory">{children}</strong>;
}

function Panel({ children, className = "", accent = false }) {
  return (
    <div
      className={`rounded-lg border p-2.5 sm:p-3 ${
        accent
          ? "border-gold/25 bg-gold/[0.05]"
          : "border-white/[0.07] bg-white/[0.03]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2.5 sm:mb-3">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-gold/30 bg-gold/[0.05] sm:h-7 sm:w-7">
          <i
            className={`fa-solid ${icon} text-[9px] text-gold-light sm:text-[10px]`}
          />
        </span>
        <h3 className="font-serif text-sm font-medium tracking-wide text-ivory sm:text-base">
          {title}
        </h3>
        <span className="h-px flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
      </div>
      {children}
    </section>
  );
}

function RarityBadge({ rarity, id, chance }) {
  const color = RARITY_HEX[id];
  return (
    <div
      className="relative flex items-center justify-between overflow-hidden rounded-lg border px-3 py-2"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: `linear-gradient(90deg, ${color}14, rgba(11,11,12,0.5) 70%)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span
          className="text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]"
          style={{ color }}
        >
          {rarity}
        </span>
      </div>
      <span className="font-mono text-[10px] tabular-nums text-ivory-dim/50 sm:text-[11px]">
        {chance}
      </span>
    </div>
  );
}

function TrumpExample({ name, rarity, effect }) {
  const color = RARITY_HEX[rarity];

  return (
    <div
      className="relative overflow-hidden rounded-lg border p-2.5 sm:p-3"
      style={{
        background: `linear-gradient(180deg, ${color}12 0%, rgba(11,11,12,0.6) 65%)`,
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      {/* Rarity hairline along the top edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}99, transparent)`,
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium tracking-wide text-ivory sm:text-[13px]">
            {name}
          </div>
          <div className="mt-0.5 text-[10px] leading-snug text-ivory-dim/60 sm:text-xs">
            {effect}
          </div>
        </div>
        <span
          className="flex-none whitespace-nowrap rounded-full border px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.15em] sm:text-[9px]"
          style={{
            color: `${color}d9`,
            borderColor: `${color}40`,
            backgroundColor: `${color}12`,
          }}
        >
          {rarity}
        </span>
      </div>
    </div>
  );
}
