import { useCallback, useEffect, useState } from 'react';
import type { LayerFilterKey, StudentNote, StudyState } from '../types/fiqh';

const STORAGE_KEY = 'muyassar.tahara.study.v1';

const DEFAULT_STATE: StudyState = {
  readBlocks: [],
  bookmarks: [],
  notes: [],
  masteredFlashcards: [],
  reviewFlashcards: [],
  quizScores: {},
  preferences: {
    darkMode: false,
    fontSize: 'md',
    showMarginalNotes: true,
    showFootnotes: true,
    visibleLayers: {
      matn: true,
      sharh: true,
      keypoint: true,
      tarjih: true,
      ziyada: true,
      qaidah: true,
    },
  },
};

function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    return {
      readBlocks: Array.isArray(parsed.readBlocks) ? parsed.readBlocks : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      masteredFlashcards: Array.isArray(parsed.masteredFlashcards) ? parsed.masteredFlashcards : [],
      reviewFlashcards: Array.isArray(parsed.reviewFlashcards) ? parsed.reviewFlashcards : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
      preferences: {
        darkMode: Boolean(parsed.preferences?.darkMode),
        fontSize:
          parsed.preferences?.fontSize === 'sm' ||
          parsed.preferences?.fontSize === 'lg' ||
          parsed.preferences?.fontSize === 'md'
            ? parsed.preferences.fontSize
            : 'md',
        showMarginalNotes: parsed.preferences?.showMarginalNotes ?? true,
        showFootnotes: parsed.preferences?.showFootnotes ?? true,
        visibleLayers: {
          matn: parsed.preferences?.visibleLayers?.matn ?? true,
          sharh: parsed.preferences?.visibleLayers?.sharh ?? true,
          keypoint: parsed.preferences?.visibleLayers?.keypoint ?? true,
          tarjih: parsed.preferences?.visibleLayers?.tarjih ?? true,
          ziyada: parsed.preferences?.visibleLayers?.ziyada ?? true,
          qaidah: parsed.preferences?.visibleLayers?.qaidah ?? true,
        },
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useStudyState() {
  const [state, setState] = useState<StudyState>(() => loadState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
    if (state.preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        darkMode: !prev.preferences.darkMode,
      },
    }));
  }, []);

  const setFontSize = useCallback((fontSize: 'sm' | 'md' | 'lg') => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, fontSize },
    }));
  }, []);

  const toggleMarginalNotes = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        showMarginalNotes: !prev.preferences.showMarginalNotes,
      },
    }));
  }, []);

  const toggleFootnotes = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        showFootnotes: !prev.preferences.showFootnotes,
      },
    }));
  }, []);

  const toggleLayer = useCallback((layer: LayerFilterKey) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        visibleLayers: {
          ...prev.preferences.visibleLayers,
          [layer]: !prev.preferences.visibleLayers[layer],
        },
      },
    }));
  }, []);

  const setMatnOnlyMode = useCallback((matnOnly: boolean) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        visibleLayers: matnOnly
          ? {
              matn: true,
              sharh: false,
              keypoint: false,
              tarjih: false,
              ziyada: false,
              qaidah: false,
            }
          : {
              matn: true,
              sharh: true,
              keypoint: true,
              tarjih: true,
              ziyada: true,
              qaidah: true,
            },
      },
    }));
  }, []);

  const toggleReadBlock = useCallback((blockId: string) => {
    setState((prev) => {
      const exists = prev.readBlocks.includes(blockId);
      return {
        ...prev,
        readBlocks: exists
          ? prev.readBlocks.filter((id) => id !== blockId)
          : [...prev.readBlocks, blockId],
      };
    });
  }, []);

  const toggleBookmark = useCallback((blockId: string) => {
    setState((prev) => {
      const exists = prev.bookmarks.includes(blockId);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((id) => id !== blockId)
          : [...prev.bookmarks, blockId],
      };
    });
  }, []);

  const saveNote = useCallback(
    (payload: {
      blockId: string;
      chapterId: string;
      blockTitle: string;
      pageNumber: number;
      content: string;
    }) => {
      const trimmed = payload.content.trim();
      setState((prev) => {
        const existingIndex = prev.notes.findIndex((n) => n.blockId === payload.blockId);
        if (!trimmed) {
          return {
            ...prev,
            notes: prev.notes.filter((n) => n.blockId !== payload.blockId),
          };
        }
        const now = new Date().toISOString();
        if (existingIndex >= 0) {
          const updated = [...prev.notes];
          updated[existingIndex] = {
            ...updated[existingIndex],
            content: trimmed,
            updatedAt: now,
          };
          return { ...prev, notes: updated };
        }
        const newNote: StudentNote = {
          id: `note-${Date.now()}`,
          blockId: payload.blockId,
          chapterId: payload.chapterId,
          blockTitle: payload.blockTitle,
          pageNumber: payload.pageNumber,
          content: trimmed,
          updatedAt: now,
        };
        return { ...prev, notes: [newNote, ...prev.notes] };
      });
    },
    []
  );

  const deleteNote = useCallback((noteId: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  }, []);

  const markFlashcard = useCallback((cardId: string, status: 'mastered' | 'review') => {
    setState((prev) => {
      const mastered = prev.masteredFlashcards.filter((id) => id !== cardId);
      const review = prev.reviewFlashcards.filter((id) => id !== cardId);
      if (status === 'mastered') mastered.push(cardId);
      else review.push(cardId);
      return {
        ...prev,
        masteredFlashcards: mastered,
        reviewFlashcards: review,
      };
    });
  }, []);

  const recordQuizScore = useCallback((chapterKey: string, correct: number, total: number) => {
    setState((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [chapterKey]: {
          correct,
          total,
          lastAttempt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const importStateJson = useCallback((jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<StudyState>;
      if (!parsed || typeof parsed !== 'object') return false;
      setState((prev) => ({
        ...prev,
        readBlocks: Array.isArray(parsed.readBlocks) ? parsed.readBlocks : prev.readBlocks,
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : prev.bookmarks,
        notes: Array.isArray(parsed.notes) ? parsed.notes : prev.notes,
        masteredFlashcards: Array.isArray(parsed.masteredFlashcards)
          ? parsed.masteredFlashcards
          : prev.masteredFlashcards,
        reviewFlashcards: Array.isArray(parsed.reviewFlashcards)
          ? parsed.reviewFlashcards
          : prev.reviewFlashcards,
        quizScores:
          parsed.quizScores && typeof parsed.quizScores === 'object'
            ? parsed.quizScores
            : prev.quizScores,
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      preferences: prev.preferences,
    }));
  }, []);

  return {
    state,
    toggleDarkMode,
    setFontSize,
    toggleMarginalNotes,
    toggleFootnotes,
    toggleLayer,
    setMatnOnlyMode,
    toggleReadBlock,
    toggleBookmark,
    saveNote,
    deleteNote,
    markFlashcard,
    recordQuizScore,
    importStateJson,
    resetProgress,
  };
}
