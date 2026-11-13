export type SegmentType =
  | 'matn'
  | 'sharh'
  | 'keypoint'
  | 'khilaf'
  | 'tarjih'
  | 'ziyada'
  | 'qaidah'
  | 'hadith';

export interface TextSegment {
  type: SegmentType;
  label?: string;
  marginalNote?: string;
  text: string;
  matnOpinion?: string;
  rajihOpinion?: string;
  dalilText?: string;
  source?: string;
}

export interface BlockFootnote {
  num: string;
  text: string;
}

export interface FiqhBlock {
  id: string;
  title: string;
  pageNumber: number;
  pageEnd?: number;
  treeNodeId?: string;
  segments: TextSegment[];
  footnotes?: BlockFootnote[];
}

export type TreeNodeCategory =
  | 'root'
  | 'ruling'
  | 'condition'
  | 'pillar'
  | 'sunnah'
  | 'tarjih'
  | 'nullifier';

export interface TreeNode {
  id: string;
  label: string;
  sublabel?: string;
  category: TreeNodeCategory;
  summary: string;
  matnQuote?: string;
  tarjihNote?: string;
  dalil?: string;
  pageNumber: number;
  blockId: string;
  children?: TreeNode[];
}

export interface Chapter {
  id: string;
  order: number;
  shortLabel: string;
  title: string;
  subtitle: string;
  pageRange: [number, number];
  overview: string;
  blocks: FiqhBlock[];
  tree: TreeNode;
}

export interface TarjihAppendixRow {
  num: number;
  chapterId: string;
  blockId: string;
  location: string;
  matn: string;
  rajih: string;
  pageNumber: number;
}

export interface ZiyadaAppendixRow {
  num: number;
  chapterId: string;
  blockId: string;
  location: string;
  topic: string;
  pageNumber: number;
}

export type QaidahKind =
  | 'قاعدة'
  | 'قاعدة منهجية'
  | 'تعريف'
  | 'فائدة اصطلاحية'
  | 'فائدة لغوية';

export interface QaidahAppendixRow {
  num: number;
  chapterId: string;
  blockId: string;
  location: string;
  kind: QaidahKind;
  text: string;
  pageNumber: number;
}

export interface Flashcard {
  id: string;
  chapterId: string;
  category: string;
  front: string;
  back: string;
  pageNumber: number;
  blockId: string;
}

export interface QuizQuestion {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pageNumber: number;
  blockId: string;
}

export type AppView = 'reader' | 'tree' | 'appendices' | 'study' | 'notebook';

export type LayerFilterKey =
  | 'matn'
  | 'sharh'
  | 'keypoint'
  | 'tarjih'
  | 'ziyada'
  | 'qaidah';

export interface StudentNote {
  id: string;
  blockId: string;
  chapterId: string;
  blockTitle: string;
  pageNumber: number;
  content: string;
  updatedAt: string;
}

export interface StudyPreferences {
  darkMode: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  showMarginalNotes: boolean;
  showFootnotes: boolean;
  visibleLayers: Record<LayerFilterKey, boolean>;
}

export interface StudyState {
  readBlocks: string[];
  bookmarks: string[];
  notes: StudentNote[];
  masteredFlashcards: string[];
  reviewFlashcards: string[];
  quizScores: Record<string, { correct: number; total: number; lastAttempt: string }>;
  preferences: StudyPreferences;
}
