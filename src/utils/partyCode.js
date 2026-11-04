import { GAME_CONFIG } from '../config/gameRules.config.js';

// No 0/O/1/I to avoid mix-ups when reading a code aloud.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePartyCode(length = GAME_CONFIG.PARTY_CODE_LENGTH) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export const normalizePartyCode = (raw) =>
  String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, GAME_CONFIG.PARTY_CODE_LENGTH);

export const isValidPartyCode = (code) => normalizePartyCode(code).length === GAME_CONFIG.PARTY_CODE_LENGTH;
