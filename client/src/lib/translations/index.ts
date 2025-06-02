import type { Translations } from './types';
import { ar } from './ar';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { sw } from './sw';
import { zh } from './zh';

export { ar } from './ar';
export { de } from './de';
export { en } from './en';
export { es } from './es';
export { fr } from './fr';
export { sw } from './sw';
export { zh } from './zh';

export const translations: Record<string, Translations> = {
  en,
  fr,
  es,
  de,
  ar,
  zh,
  sw,
};
