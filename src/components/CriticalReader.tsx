import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  GitBranch,
  Info,
  Moon,
  NotebookPen,
  Sun,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CHAPTERS } from '../data';
import type {
  FiqhBlock,
  LayerFilterKey,
  StudentNote,
  StudyPreferences,
  TextSegment,
} from '../types/fiqh';
import {
  getSegmentBadgeLabel,
  segmentTypeToLayer,
  toArabicDigits,
} from '../utils/arabic';

interface CriticalReaderProps {
  selectedChapterId: string;
  focusedBlockId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onJumpToTree: (chapterId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
  preferences: StudyPreferences;
  onToggleLayer: (layer: LayerFilterKey) => void;
  onSetMatnOnly: (matnOnly: boolean) => void;
  onToggleMarginalNotes: () => void;
  onToggleFootnotes: () => void;
  onSetFontSize: (size: 'sm' | 'md' | 'lg') => void;
  onToggleDarkMode: () => void;
  readBlocks: string[];
  bookmarks: string[];
  notes: StudentNote[];
  onToggleRead: (blockId: string) => void;
  onToggleBookmark: (blockId: string) => void;
  onSaveNote: (payload: {
    blockId: string;
    chapterId: string;
    blockTitle: string;
    pageNumber: number;
    content: string;
  }) => void;
}

const LAYER_CONTROLS: { key: LayerFilterKey; label: string }[] = [
  { key: 'matn', label: 'المتن' },
  { key: 'sharh', label: 'الشرح ○ والأحاديث' },
  { key: 'keypoint', label: 'النقاط والخلاف ■' },
  { key: 'tarjih', label: 'الترجيح' },
  { key: 'ziyada', label: 'الزيادات على المتن' },
  { key: 'qaidah', label: 'القواعد والتعريفات' },
];

export function CriticalReader({
  selectedChapterId,
  focusedBlockId,
  onSelectChapter,
  onJumpToTree,
  onPreviewPdf,
  preferences,
  onToggleLayer,
  onSetMatnOnly,
  onToggleMarginalNotes,
  onToggleFootnotes,
  onSetFontSize,
  onToggleDarkMode,
  readBlocks,
  bookmarks,
  notes,
  onToggleRead,
  onToggleBookmark,
  onSaveNote,
}: CriticalReaderProps) {
  const [editingNoteBlockId, setEditingNoteBlockId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [showLegend, setShowLegend] = useState<boolean>(false);

  const chapter = CHAPTERS.find((c) => c.id === selectedChapterId) ?? CHAPTERS[0];

  useEffect(() => {
    if (!focusedBlockId) return;
    const el = document.getElementById(`block-${focusedBlockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusedBlockId, selectedChapterId]);

  const isMatnOnly =
    preferences.visibleLayers.matn &&
    !preferences.visibleLayers.sharh &&
    !preferences.visibleLayers.keypoint &&
    !preferences.visibleLayers.tarjih &&
    !preferences.visibleLayers.ziyada &&
    !preferences.visibleLayers.qaidah;

  const fontClass =
    preferences.fontSize === 'sm'
      ? 'text-[15px]'
      : preferences.fontSize === 'lg'
        ? 'text-[19px]'
        : 'text-[17px]';

  const openNoteEditor = (block: FiqhBlock) => {
    const existing = notes.find((n) => n.blockId === block.id);
    setNoteDraft(existing?.content ?? '');
    setEditingNoteBlockId(block.id);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
        {/* Sidebar: 11 Units */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-3">
            <div className="mb-2.5 flex items-center justify-between px-2 text-xs font-semibold text-[var(--ink-muted)]">
              <span>فهرس المذكرة</span>
              <span className="tabular-nums-ar">{toArabicDigits(CHAPTERS.length)} أقسام</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {CHAPTERS.map((ch) => {
                const isSelected = ch.id === chapter.id;
                const doneCount = ch.blocks.filter((b) => readBlocks.includes(b.id)).length;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onSelectChapter(ch.id)}
                    className={`flex shrink-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-right text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] font-bold text-[var(--accent-gold)]'
                        : 'border-transparent text-[var(--ink-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    <span className="truncate">{ch.shortLabel}</span>
                    <span className="shrink-0 text-[11px] text-[var(--ink-muted)] tabular-nums-ar">
                      {toArabicDigits(doneCount)}/{toArabicDigits(ch.blocks.length)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Page Jump Card */}
          <div className="hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 lg:block">
            <div className="text-xs font-semibold text-[var(--ink-primary)]">
              صفحات الأصل لهذا الباب
            </div>
            <p className="mt-1 text-xs text-[var(--ink-muted)] tabular-nums-ar">
              من ص {toArabicDigits(chapter.pageRange[0])} إلى ص {toArabicDigits(chapter.pageRange[1])}
            </p>
            <button
              type="button"
              onClick={() => onPreviewPdf(chapter.pageRange[0])}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>معاينة بداية الباب</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <section className="min-w-0 space-y-6">
          {/* Chapter Title Header */}
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
                  {chapter.shortLabel} · ص {toArabicDigits(chapter.pageRange[0])}–{toArabicDigits(chapter.pageRange[1])}
                </div>
                <h1 className="headline-balance font-matn text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
                  {chapter.title}
                </h1>
                <p className="text-sm text-[var(--ink-secondary)]">{chapter.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToTree(chapter.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>التشجير البصري</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPreviewPdf(chapter.pageRange[0])}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>صفحة الكتاب</span>
                </button>
              </div>
            </div>

            <p className="mt-4 border-t border-[var(--border-hairline)] pt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {chapter.overview}
            </p>
          </div>

          {/* Investigation Layer & Reading Preferences Bar */}
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {LAYER_CONTROLS.map((ctrl) => {
                  const active = preferences.visibleLayers[ctrl.key];
                  return (
                    <button
                      key={ctrl.key}
                      type="button"
                      onClick={() => onToggleLayer(ctrl.key)}
                      aria-pressed={active}
                      className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] text-[var(--ink-primary)]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-muted)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      {ctrl.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => onSetMatnOnly(!isMatnOnly)}
                  aria-pressed={isMatnOnly}
                  className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    isMatnOnly
                      ? 'border-[var(--border-strong)] bg-[var(--accent-gold)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--accent-gold)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  وضع المتن فقط
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMarginalNotes}
                  aria-pressed={preferences.showMarginalNotes}
                  className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs cursor-pointer ${
                    preferences.showMarginalNotes
                      ? 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-muted)]'
                  }`}
                >
                  الهامش الجانبي
                </button>
                <button
                  type="button"
                  onClick={onToggleFootnotes}
                  aria-pressed={preferences.showFootnotes}
                  className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs cursor-pointer ${
                    preferences.showFootnotes
                      ? 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-muted)]'
                  }`}
                >
                  التخريجات
                </button>

                {/* Font size */}
                <div className="flex items-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-0.5">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => onSetFontSize(sz)}
                      className={`px-2 py-0.5 text-xs rounded cursor-pointer ${
                        preferences.fontSize === sz
                          ? 'bg-[var(--accent-gold-bg)] font-semibold text-[var(--accent-gold)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      {sz === 'sm' ? 'صغير' : sz === 'md' ? 'وسط' : 'كبير'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  aria-label={preferences.darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  {preferences.darkMode ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowLegend((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>دليل الرموز</span>
                  {showLegend ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {showLegend && (
              <div className="grid gap-2 border-t border-[var(--border-hairline)] pt-3 text-xs text-[var(--ink-secondary)] sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <strong className="text-[var(--accent-gold)]">المتن:</strong> نص «الفقه الميسر» موثقاً بلفظه في إطار ذهبي هادئ.
                </div>
                <div>
                  <strong className="text-[var(--ink-primary)]">الشرح (○):</strong> الصياغة العلمية التقريرية مصحوبةً بعناوين هامشية.
                </div>
                <div>
                  <strong className="text-[var(--accent-bronze)]">النقاط والخلاف (■):</strong> خلاصات المسائل وضوابطها ونقل الخلاف المعتبر.
                </div>
                <div>
                  <strong className="text-[var(--accent-olive)]">الترجيح:</strong> مقارنة بين تقرير المتن والقول الراجح والدليل والتعليل.
                </div>
                <div>
                  <strong className="text-[var(--accent-umber)]">الزيادات والأحاديث:</strong> ما زاد على المتن من فوائد، والنصوص المسندة المخرَّجة.
                </div>
                <div>
                  <strong className="text-[var(--accent-bronze)]">القواعد والتعريفات:</strong> القواعد الفقهية والأصولية والضوابط الاصطلاحية.
                </div>
              </div>
            )}
          </div>

          {/* Blocks */}
          <div className="space-y-6">
            {chapter.blocks.map((block) => {
              const isRead = readBlocks.includes(block.id);
              const isBookmarked = bookmarks.includes(block.id);
              const existingNote = notes.find((n) => n.blockId === block.id);
              const isFocused = focusedBlockId === block.id;

              const visibleSegments = block.segments.filter(
                (seg) => preferences.visibleLayers[segmentTypeToLayer(seg.type)]
              );

              return (
                <article
                  key={block.id}
                  id={`block-${block.id}`}
                  className={`scroll-mt-6 rounded-lg border bg-[var(--bg-elevated)] p-5 sm:p-6 transition-colors ${
                    isFocused
                      ? 'border-[var(--border-strong)]'
                      : 'border-[var(--border-hairline)]'
                  }`}
                >
                  {/* Block Header */}
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-hairline)] pb-4">
                    <div className="space-y-1">
                      <h2 className="headline-balance font-matn text-xl font-bold text-[var(--ink-primary)] sm:text-2xl">
                        {block.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)] tabular-nums-ar">
                        <span>
                          صفحة {toArabicDigits(block.pageNumber)}
                          {block.pageEnd && block.pageEnd !== block.pageNumber
                            ? `–${toArabicDigits(block.pageEnd)}`
                            : ''}
                        </span>
                        {isRead && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-[var(--accent-olive)]">
                              تمت المذاكرة
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewPdf(block.pageNumber)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>صفحة الأصل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleRead(block.id)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                          isRead
                            ? 'border-[var(--border-strong)] bg-[var(--accent-olive-bg)] text-[var(--accent-olive)]'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isRead ? 'تمت' : 'إتمام'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleBookmark(block.id)}
                        aria-label="حفظ في الإشارات المرجعية"
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer ${
                          isBookmarked
                            ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] text-[var(--accent-gold)]'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>{isBookmarked ? 'محفوظ' : 'حفظ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openNoteEditor(block)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs cursor-pointer ${
                          existingNote
                            ? 'border-[var(--border-strong)] bg-[var(--accent-bronze-bg)] text-[var(--accent-bronze)]'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        <NotebookPen className="h-3.5 w-3.5" />
                        <span>{existingNote ? 'ملاحظة' : 'تدوين'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Segments */}
                  {visibleSegments.length === 0 ? (
                    <p className="py-4 text-center text-xs text-[var(--ink-muted)]">
                      تم إخفاء جميع طبقات هذه المسألة بواسطة المرشحات النشطة أعلاه.
                    </p>
                  ) : (
                    <div className={`space-y-4 leading-relaxed ${fontClass}`}>
                      {visibleSegments.map((seg, idx) => (
                        <SegmentCard
                          key={`${block.id}-seg-${idx}`}
                          segment={seg}
                          showMarginalNotes={preferences.showMarginalNotes}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footnotes */}
                  {preferences.showFootnotes && block.footnotes && block.footnotes.length > 0 && (
                    <div className="mt-5 border-t border-[var(--border-hairline)] pt-3">
                      <div className="mb-1.5 text-xs font-semibold text-[var(--ink-muted)]">
                        حاشية التخريج والإحالات
                      </div>
                      <ul className="space-y-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                        {block.footnotes.map((fn) => (
                          <li key={fn.num}>
                            <span className="font-semibold text-[var(--accent-gold)] tabular-nums-ar">
                              ({fn.num}){' '}
                            </span>
                            <span>{fn.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Student Note Box / Editor */}
                  {editingNoteBlockId === block.id ? (
                    <div className="mt-5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-paper)] p-4">
                      <label className="mb-2 block text-xs font-semibold text-[var(--ink-primary)]">
                        ملاحظتك الشخصية على: {block.title}
                      </label>
                      <textarea
                        rows={3}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="دوّن فائدة، أو ضابطاً، أو سؤالاً للمراجعة..."
                        className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-2.5 text-sm text-[var(--ink-primary)]"
                      />
                      <div className="mt-2.5 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNoteBlockId(null)}
                          className="rounded-md border border-[var(--border-hairline)] px-3 py-1 text-xs text-[var(--ink-secondary)] cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSaveNote({
                              blockId: block.id,
                              chapterId: chapter.id,
                              blockTitle: block.title,
                              pageNumber: block.pageNumber,
                              content: noteDraft,
                            });
                            setEditingNoteBlockId(null);
                          }}
                          className="rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-3 py-1 text-xs font-medium text-white cursor-pointer"
                        >
                          حفظ الملاحظة
                        </button>
                      </div>
                    </div>
                  ) : (
                    existingNote && (
                      <div className="mt-5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-xs">
                        <div className="mb-1 flex items-center justify-between font-semibold text-[var(--accent-bronze)]">
                          <span>ملاحظة الطالب المحفوظة</span>
                          <button
                            type="button"
                            onClick={() => openNoteEditor(block)}
                            className="underline cursor-pointer"
                          >
                            تعديل
                          </button>
                        </div>
                        <p className="whitespace-pre-line text-sm text-[var(--ink-primary)]">
                          {existingNote.content}
                        </p>
                      </div>
                    )
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function SegmentCard({
  segment,
  showMarginalNotes,
}: {
  segment: TextSegment;
  showMarginalNotes: boolean;
}) {
  if (segment.type === 'matn') {
    return (
      <div className="rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold-bg)] p-4 sm:p-5">
        <div className="mb-2 text-xs font-bold text-[var(--accent-gold)]">
          {getSegmentBadgeLabel(segment.type, segment.label)}
        </div>
        <div className="font-matn whitespace-pre-line leading-loose text-[var(--ink-primary)]">
          {segment.text}
        </div>
      </div>
    );
  }

  if (segment.type === 'tarjih') {
    return (
      <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-olive-bg)] p-4 sm:p-5 space-y-3">
        <div className="text-xs font-bold text-[var(--accent-olive)]">
          {getSegmentBadgeLabel(segment.type, segment.label)}
        </div>

        {(segment.matnOpinion || segment.rajihOpinion) && (
          <div className="grid gap-3 md:grid-cols-2">
            {segment.matnOpinion && (
              <div className="rounded border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-3">
                <div className="mb-1 text-xs font-semibold text-[var(--accent-gold)]">
                  تقرير المتن
                </div>
                <p className="text-sm leading-relaxed text-[var(--ink-primary)]">
                  {segment.matnOpinion}
                </p>
              </div>
            )}
            {segment.rajihOpinion && (
              <div className="rounded border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-3">
                <div className="mb-1 text-xs font-semibold text-[var(--accent-olive)]">
                  القول الراجح
                </div>
                <p className="text-sm font-medium leading-relaxed text-[var(--ink-primary)]">
                  {segment.rajihOpinion}
                </p>
              </div>
            )}
          </div>
        )}

        {segment.dalilText && (
          <div className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            <strong className="text-[var(--ink-primary)]">الدليل والتعليل: </strong>
            {segment.dalilText}
          </div>
        )}

        {!segment.matnOpinion && !segment.rajihOpinion && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink-primary)]">
            {segment.text}
          </p>
        )}
      </div>
    );
  }

  if (segment.type === 'ziyada') {
    return (
      <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-umber-bg)] p-4">
        <div className="mb-1.5 text-xs font-bold text-[var(--accent-umber)]">
          {getSegmentBadgeLabel(segment.type, segment.label)}
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink-primary)]">
          {segment.text}
        </p>
      </div>
    );
  }

  if (segment.type === 'qaidah') {
    return (
      <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-bronze-bg)] p-4">
        <div className="mb-1.5 text-xs font-bold text-[var(--accent-bronze)]">
          {getSegmentBadgeLabel(segment.type, segment.label)}
        </div>
        <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-[var(--ink-primary)]">
          {segment.text}
        </p>
      </div>
    );
  }

  if (segment.type === 'keypoint' || segment.type === 'khilaf') {
    return (
      <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[var(--accent-bronze)]">
          <span aria-hidden="true">■</span>
          <span>{getSegmentBadgeLabel(segment.type, segment.label)}</span>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink-primary)]">
          {segment.text}
        </p>
      </div>
    );
  }

  if (segment.type === 'hadith') {
    return (
      <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-umber-bg)] p-4">
        <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[150px_1fr] lg:gap-4">
          {showMarginalNotes && segment.marginalNote ? (
            <div className="text-xs font-semibold text-[var(--accent-umber)]">
              {segment.marginalNote}
            </div>
          ) : (
            <div className="text-xs font-semibold text-[var(--accent-umber)]">
              حديث وشاهد
            </div>
          )}
          <p className="font-matn whitespace-pre-line leading-loose text-[var(--ink-primary)]">
            {segment.text}
          </p>
        </div>
      </div>
    );
  }

  // Default: 'sharh' (with ○ symbol and optional marginalNote)
  return (
    <div className="py-1">
      {showMarginalNotes && segment.marginalNote ? (
        <div className="flex flex-col gap-1.5 lg:grid lg:grid-cols-[150px_1fr] lg:gap-5">
          <div className="text-xs font-semibold leading-relaxed text-[var(--accent-gold)]">
            {segment.marginalNote}
          </div>
          <p className="whitespace-pre-line text-[var(--ink-primary)]">
            <span className="ml-1.5 text-xs text-[var(--ink-muted)]" aria-hidden="true">
              ○
            </span>
            {segment.text}
          </p>
        </div>
      ) : (
        <p className="whitespace-pre-line text-[var(--ink-primary)]">
          <span className="ml-1.5 text-xs text-[var(--ink-muted)]" aria-hidden="true">
            ○
          </span>
          {segment.text}
        </p>
      )}
    </div>
  );
}
