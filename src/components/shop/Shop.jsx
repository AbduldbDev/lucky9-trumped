import { useState } from 'react';
import { CARD_SKINS_SHOP } from '../../config/cardSkins.config.js';
import Card from '../cards/Card.jsx';

export default function Shop({ profile, onBuy, onEquip, onClose }) {
  const [busy,  setBusy]  = useState(null);
  const [error, setError] = useState('');

  const run = async (id, fn) => {
    setBusy(id); setError('');
    try { await fn(id); } catch (e) { setError(e.message); } finally { setBusy(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
      bg-black/75 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden
        border border-white/8 bg-[#080f0a]"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="font-serif font-bold text-base text-gold-light">Card Shop</h2>
            <p className="text-[10px] text-white/20 mt-0.5">Win matches to earn chips</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-sm text-gold-DEFAULT">
              <i className="fa-solid fa-coins mr-1.5 text-gold-DEFAULT/60" />{profile.chips}
            </span>
            <button onClick={onClose} className="text-white/20 hover:text-white transition p-1">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Items */}
        <ul className="divide-y divide-white/5 max-h-[55vh] overflow-y-auto">
          {CARD_SKINS_SHOP.map(skin => {
            const owned    = profile.owned.includes(skin.id);
            const equipped = profile.equippedSkinId === skin.id;
            return (
              <li key={skin.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition">
                <Card faceDown skinId={skin.id} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ivory-DEFAULT">{skin.name}</div>
                  <div className="text-[10px] text-white/25 mt-0.5">{skin.rarity}</div>
                  <div className="text-xs font-semibold mt-1">
                    {skin.price === 0
                      ? <span className="text-emerald-400/70">Free</span>
                      : <span className="text-gold-DEFAULT">
                          <i className="fa-solid fa-coins mr-1 text-gold-DEFAULT/50" />{skin.price}
                        </span>
                    }
                  </div>
                </div>
                <div className="shrink-0">
                  {equipped ? (
                    <span className="rounded-lg border border-emerald-700/30 bg-emerald-900/30
                      px-3 py-1.5 text-xs font-semibold text-emerald-400">
                      <i className="fa-solid fa-check mr-1" />Equipped
                    </span>
                  ) : owned ? (
                    <button disabled={busy === skin.id} onClick={() => run(skin.id, onEquip)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5
                        text-xs font-semibold text-white/50 hover:text-white hover:border-white/20
                        disabled:opacity-30 transition">
                      Equip
                    </button>
                  ) : (
                    <button disabled={busy === skin.id || profile.chips < skin.price}
                      onClick={() => run(skin.id, onBuy)}
                      className="rounded-lg border border-gold-DEFAULT/30 bg-gold-faint/30 px-3 py-1.5
                        text-xs font-semibold text-gold-light hover:bg-gold-faint/50
                        disabled:opacity-25 disabled:cursor-not-allowed transition">
                      Buy
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {error && (
          <p className="px-5 py-2 text-xs text-red-400/70 border-t border-white/5">
            <i className="fa-solid fa-circle-exclamation mr-1" />{error}
          </p>
        )}
      </div>
    </div>
  );
}
