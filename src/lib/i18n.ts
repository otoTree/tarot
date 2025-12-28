import { translations, Language, Translation } from "./translations";
import { SPREADS } from "./spreads";
import { SPREADS_ZH } from "./spreads.zh";
import { CARDS } from "./cards";
import { CARDS_ZH } from "./cards.zh";
import { Spread, TarotCard } from "@/types/tarot";

export const getTranslation = (lang: Language): Translation => translations[lang];

export const getSpreads = (lang: Language): Spread[] => {
  return lang === 'zh' ? SPREADS_ZH : SPREADS;
};

export const getCards = (lang: Language): TarotCard[] => {
  return lang === 'zh' ? CARDS_ZH : CARDS;
};

export const getCard = (id: string, lang: Language): TarotCard => {
  const cards = getCards(lang);
  return cards.find(c => c.id === id) || CARDS.find(c => c.id === id)!;
};

export const getSpread = (id: string, lang: Language): Spread => {
  const spreads = getSpreads(lang);
  return spreads.find(s => s.id === id) || SPREADS.find(s => s.id === id)!;
};
