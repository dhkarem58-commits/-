import {
  ArrowUpLeft,
  CheckCircle2,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CHAPTERS, FLASHCARDS, QUIZ_QUESTIONS } from '../data';
import { toArabicDigits } from '../utils/arabic';

interface StudyCenterProps {
  masteredFlashcards: string[];
  reviewFlashcards: string[];
  quizScores: Record<string, { correct: number; total: number; lastAttempt: string }>;
  onMarkFlashcard: (cardId: string, status: 'mastered' | 'review') => void;
  onRecordQuizScore: (chapterKey: string, correct: number, total: number) => void;
  onJumpToReader: (chapterId: string, blockId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
}

export function StudyCenter({
  masteredFlashcards,
  reviewFlashcards,
  quizScores,
  onMarkFlashcard,
  onRecordQuizScore,
  onJumpToReader,
  onPreviewPdf,
}: StudyCenterProps) {
  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [cardOnlyReview, setCardOnlyReview] = useState<boolean>(false);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState<number>(0);
  const [sessionAnswered, setSessionAnswered] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const filteredCards = useMemo(() => {
    return FLASHCARDS.filter((c) => {
      if (chapterFilter !== 'all' && c.chapterId !== chapterFilter) return false;
      if (cardOnlyReview && !reviewFlashcards.includes(c.id)) return false;
      return true;
    });
  }, [chapterFilter, cardOnlyReview, reviewFlashcards]);

  const filteredQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) =>
      chapterFilter === 'all' ? true : q.chapterId === chapterFilter
    );
  }, [chapterFilter]);

  const safeCardIndex =
    filteredCards.length > 0 ? cardIndex % filteredCards.length : 0;
  const activeCard = filteredCards[safeCardIndex];

  const safeQuizIndex =
    filteredQuestions.length > 0 ? quizIndex % filteredQuestions.length : 0;
  const activeQuestion = filteredQuestions[safeQuizIndex];

  const handleSelectChapterFilter = (val: string) => {
    setChapterFilter(val);
    setCardIndex(0);
    setFlipped(false);
    setQuizIndex(0);
    setSelectedOption(null);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setQuizFinished(false);
  };

  const handleAnswerOption = (idx: number) => {
    if (selectedOption !== null || !activeQuestion) return;
    setSelectedOption(idx);
    const isCorrect = idx === activeQuestion.correctIndex;
    const nextCorrect = isCorrect ? sessionCorrect + 1 : sessionCorrect;
    const nextAnswered = sessionAnswered + 1;
    setSessionCorrect(nextCorrect);
    setSessionAnswered(nextAnswered);

    if (safeQuizIndex + 1 >= filteredQuestions.length) {
      onRecordQuizScore(chapterFilter, nextCorrect, filteredQuestions.length);
    }
  };

  const handleNextQuestion = () => {
    if (safeQuizIndex + 1 >= filteredQuestions.length) {
      setQuizFinished(true);
    } else {
      setQuizIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setSessionCorrect(0);
    setSessionAnswered(0);
    setQuizFinished(false);
  };

  const lastChapterScore = quizScores[chapterFilter];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <h1 className="headline-balance font-matn text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
            المراجعة والاختبارات التفاعلية
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
            بطاقات استذكار وأسئلة تقويمية شاملة لمسائل الطهارة والترجيحات المخالفة للمتن والقواعد.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums-ar text-[var(--ink-secondary)]">
          <span>
            البطاقات المتقنة:{' '}
            <strong className="text-[var(--accent-olive)]">
              {toArabicDigits(masteredFlashcards.length)}/{toArabicDigits(FLASHCARDS.length)}
            </strong>
          </span>
          <span>
            للمراجعة:{' '}
            <strong className="text-[var(--accent-bronze)]">
              {toArabicDigits(reviewFlashcards.length)}
            </strong>
          </span>
        </div>
      </div>

      {/* Mode Switcher & Chapter Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('flashcards')}
            className={`whitespace-nowrap shrink-0 rounded-md border px-4 py-1.5 text-sm font-semibold cursor-pointer ${
              mode === 'flashcards'
                ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] text-[var(--accent-gold)]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)]'
            }`}
          >
            بطاقات الاستذكار ({toArabicDigits(FLASHCARDS.length)})
          </button>
          <button
            type="button"
            onClick={() => setMode('quiz')}
            className={`whitespace-nowrap shrink-0 rounded-md border px-4 py-1.5 text-sm font-semibold cursor-pointer ${
              mode === 'quiz'
                ? 'border-[var(--border-strong)] bg-[var(--accent-olive-bg)] text-[var(--accent-olive)]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)]'
            }`}
          >
            الاختبار التقويمي ({toArabicDigits(QUIZ_QUESTIONS.length)})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'flashcards' && (
            <button
              type="button"
              onClick={() => {
                setCardOnlyReview((v) => !v);
                setCardIndex(0);
                setFlipped(false);
              }}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                cardOnlyReview
                  ? 'border-[var(--border-strong)] bg-[var(--accent-bronze-bg)] text-[var(--accent-bronze)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)]'
              }`}
            >
              بطاقات المراجعة فقط
            </button>
          )}

          <select
            value={chapterFilter}
            onChange={(e) => handleSelectChapterFilter(e.target.value)}
            aria-label="تصفية حسب القسم أو الباب"
            className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-1.5 text-xs text-[var(--ink-primary)]"
          >
            <option value="all">جميع الأقسام والأبواب</option>
            {CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.shortLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flashcards Workspace */}
      {mode === 'flashcards' && (
        <div className="mx-auto max-w-3xl">
          {!activeCard ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-8 text-center text-sm text-[var(--ink-muted)]">
              لا توجد بطاقات مطابقة للتصفية المحددة.
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)] tabular-nums-ar">
                <span>
                  {activeCard.category} · ص {toArabicDigits(activeCard.pageNumber)}
                </span>
                <span>
                  البطاقة {toArabicDigits(safeCardIndex + 1)} من{' '}
                  {toArabicDigits(filteredCards.length)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-6 text-right transition-colors hover:border-[var(--border-strong)] cursor-pointer min-h-[190px] flex flex-col justify-between"
              >
                <div>
                  <div className="mb-2 text-xs font-semibold text-[var(--accent-gold)]">
                    {flipped ? 'الجواب والتحرير الفقهي' : 'السؤال الفقهي (اضغط لكشف الجواب)'}
                  </div>
                  <p className="font-matn text-xl leading-relaxed text-[var(--ink-primary)]">
                    {flipped ? activeCard.back : activeCard.front}
                  </p>
                </div>
                <div className="mt-4 text-xs text-[var(--ink-muted)]">
                  {flipped ? 'اضغط للعودة إلى السؤال' : 'اضغط لعرض الجواب'}
                </div>
              </button>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onMarkFlashcard(activeCard.id, 'mastered');
                      setFlipped(false);
                      setCardIndex((i) => i + 1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--accent-olive-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-olive)] cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>أتقنتها</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMarkFlashcard(activeCard.id, 'review');
                      setFlipped(false);
                      setCardIndex((i) => i + 1);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--accent-bronze-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-bronze)] cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>أراجعها لاحقاً</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewPdf(activeCard.pageNumber)}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>ص {toArabicDigits(activeCard.pageNumber)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onJumpToReader(activeCard.chapterId, activeCard.blockId)
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                  >
                    <span>الموضع</span>
                    <ArrowUpLeft className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setCardIndex((i) =>
                        i === 0 ? filteredCards.length - 1 : i - 1
                      );
                    }}
                    className="rounded-md border border-[var(--border-hairline)] px-3 py-1.5 text-xs text-[var(--ink-secondary)] cursor-pointer"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFlipped(false);
                      setCardIndex((i) => i + 1);
                    }}
                    className="rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-3 py-1.5 text-xs font-medium text-white cursor-pointer"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Workspace */}
      {mode === 'quiz' && (
        <div className="mx-auto max-w-3xl">
          {filteredQuestions.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-8 text-center text-sm text-[var(--ink-muted)]">
              لا توجد أسئلة اختبار مخصصة لهذا الباب حالياً؛ اختر «جميع الأقسام والأبواب» للاختبار الشامل.
            </div>
          ) : quizFinished ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 text-center space-y-4">
              <h2 className="font-matn text-2xl font-bold text-[var(--ink-primary)]">
                انتهى الاختبار
              </h2>
              <p className="text-base text-[var(--ink-secondary)] tabular-nums-ar">
                نتيجتك:{' '}
                <strong className="text-[var(--accent-olive)]">
                  {toArabicDigits(sessionCorrect)}
                </strong>{' '}
                من {toArabicDigits(filteredQuestions.length)} إجابة صحيحة
              </p>
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>إعادة الاختبار</span>
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3 text-xs text-[var(--ink-muted)] tabular-nums-ar">
                <span>
                  السؤال {toArabicDigits(safeQuizIndex + 1)} من{' '}
                  {toArabicDigits(filteredQuestions.length)}
                </span>
                <div className="flex items-center gap-3">
                  <span>
                    النتيجة الجارية: {toArabicDigits(sessionCorrect)}/
                    {toArabicDigits(sessionAnswered)}
                  </span>
                  {lastChapterScore && (
                    <span>
                      · آخر محاولة: {toArabicDigits(lastChapterScore.correct)}/
                      {toArabicDigits(lastChapterScore.total)}
                    </span>
                  )}
                </div>
              </div>

              <h2 className="headline-balance font-matn text-xl font-bold leading-relaxed text-[var(--ink-primary)]">
                {activeQuestion.question}
              </h2>

              <div className="space-y-2.5">
                {activeQuestion.options.map((opt, idx) => {
                  const isAnswered = selectedOption !== null;
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeQuestion.correctIndex;

                  let styleClass =
                    'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]';
                  if (isAnswered) {
                    if (isCorrect) {
                      styleClass =
                        'border-[var(--border-strong)] bg-[var(--accent-olive-bg)] text-[var(--accent-olive)] font-semibold';
                    } else if (isSelected) {
                      styleClass =
                        'border-[var(--border-strong)] bg-[var(--accent-umber-bg)] text-[var(--accent-umber)]';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleAnswerOption(idx)}
                      className={`w-full rounded-md border p-3.5 text-right text-sm leading-relaxed transition-colors cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <span className="ml-2 font-semibold tabular-nums-ar">
                        {toArabicDigits(idx + 1)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 space-y-3">
                  <div className="text-xs font-bold text-[var(--ink-primary)]">
                    التوجيه والتحرير الفقهي (ص {toArabicDigits(activeQuestion.pageNumber)})
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                    {activeQuestion.explanation}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewPdf(activeQuestion.pageNumber)}
                        className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-xs text-[var(--ink-secondary)] cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>صفحة الأصل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onJumpToReader(
                            activeQuestion.chapterId,
                            activeQuestion.blockId
                          )
                        }
                        className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-xs text-[var(--ink-secondary)] cursor-pointer"
                      >
                        <span>المسألة في القارئ</span>
                        <ArrowUpLeft className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-4 py-1.5 text-xs font-semibold text-white cursor-pointer"
                    >
                      {safeQuizIndex + 1 >= filteredQuestions.length
                        ? 'عرض النتيجة النهائية'
                        : 'السؤال التالي'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
