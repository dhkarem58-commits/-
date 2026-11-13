import type { FiqhBlock } from '../types/fiqh';
import { CHAPTERS_INTRO_TO_TWO } from './chaptersIntroToTwo';
import { CHAPTERS_NINE_TO_TEN } from './chaptersNineToTen';
import { CHAPTERS_SIX_TO_EIGHT } from './chaptersSixToEight';
import { CHAPTERS_THREE_TO_FIVE } from './chaptersThreeToFive';

export { QAIDAH_APPENDIX, TARJIH_APPENDIX, ZIYADA_APPENDIX } from './appendices';
export { FLASHCARDS, QUIZ_QUESTIONS } from './studyBank';

export const CHAPTERS = [
  ...CHAPTERS_INTRO_TO_TWO,
  ...CHAPTERS_THREE_TO_FIVE,
  ...CHAPTERS_SIX_TO_EIGHT,
  ...CHAPTERS_NINE_TO_TEN,
];

export const PDF_ASSET_URL =
  './assets/aistudio/_________________________________-_________________________________________________02af5dde.pdf';

export const TOTAL_PDF_PAGES = 128;

export function findBlockById(blockId: string) {
  for (const ch of CHAPTERS) {
    const block: FiqhBlock | undefined = ch.blocks.find((b) => b.id === blockId);
    if (block) return { chapter: ch, block };
  }
  return null;
}

export function findChapterById(chapterId: string) {
  return CHAPTERS.find((c) => c.id === chapterId) ?? null;
}
