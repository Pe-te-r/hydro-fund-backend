import { customAlphabet } from 'nanoid';

const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijklmnopqrstuvwxyz';
const CODE_LENGTH = 8;

export const generateReferralCode = customAlphabet(REFERRAL_ALPHABET, CODE_LENGTH);

