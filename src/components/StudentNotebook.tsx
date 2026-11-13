import {
  ArrowUpLeft,
  BookmarkX,
  Download,
  Eye,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { CHAPTERS, FLASHCARDS, findBlockById } from '../data';
import type { StudyState } from '../types/fiqh';
import { toArabicDigits } from '../utils/arabic';

interface StudentNotebookProps {
  state: StudyState;
  onJumpToReader: (chapterId: string, blockId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleBookmark: (blockId: string) => void;
  onImportJson: (jsonText: string) => boolean;
  onResetProgress: () => void;
}

export function StudentNotebook({
  state,
  onJumpToReader,
  onPreviewPdf,
  onDeleteNote,
  onToggleBookmark,
  onImportJson,
  onResetProgress,
}: StudentNotebookProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const totalBlocks = useMemo(
    () => CHAPTERS.reduce((sum, ch) => sum + ch.blocks.length, 0),
    []
  );

  const readPercent = Math.round(
    (state.readBlocks.length / Math.max(1, totalBlocks)) * 100
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muyassar-tahara-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportJson(String(reader.result ?? ''));
      setImportStatus(
        ok
          ? 'تم استيراد الملاحظات والتقدم بنجاح.'
          : 'تعذر قراءة الملف؛ تأكد من أنه بصيغة JSON صحيحة.'
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 space-y-6">
      {/* Header & Data Controls */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <h1 className="headline-balance font-matn text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
            مذكرة الطالب وسجل الإنجاز
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
            ملاحظاتك الشخصية، والإشارات المرجعية، وتقدمك عبر التمهيد والأبواب العشرة (تحفظ محلياً ويمكن تصديرها).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>تصدير JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>استيراد JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--accent-umber)] hover:border-[var(--border-strong)] cursor-pointer"
            >
              تصفير السجل
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--accent-umber-bg)] px-2.5 py-1 text-xs">
              <span className="text-[var(--accent-umber)] font-medium">تأكيد المسح؟</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="font-bold text-[var(--accent-umber)] underline cursor-pointer"
              >
                نعم
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="text-[var(--ink-secondary)] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {importStatus && (
        <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-4 py-2.5 text-xs text-[var(--ink-primary)]">
          {importStatus}
        </div>
      )}

      {/* Progress KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4">
          <div className="text-xs text-[var(--ink-muted)]">نسبة الإنجاز القرائي</div>
          <div className="mt-1 font-matn text-2xl font-bold text-[var(--accent-gold)] tabular-nums-ar">
            {toArabicDigits(readPercent)}٪
          </div>
          <div className="mt-1 text-xs text-[var(--ink-secondary)] tabular-nums-ar">
            {toArabicDigits(state.readBlocks.length)} من {toArabicDigits(totalBlocks)} مسألة
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4">
          <div className="text-xs text-[var(--ink-muted)]">الإشارات المرجعية</div>
          <div className="mt-1 font-matn text-2xl font-bold text-[var(--ink-primary)] tabular-nums-ar">
            {toArabicDigits(state.bookmarks.length)}
          </div>
          <div className="mt-1 text-xs text-[var(--ink-secondary)]">مسألة محفوظة</div>
        </div>

        <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4">
          <div className="text-xs text-[var(--ink-muted)]">الملاحظات المدونة</div>
          <div className="mt-1 font-matn text-2xl font-bold text-[var(--accent-bronze)] tabular-nums-ar">
            {toArabicDigits(state.notes.length)}
          </div>
          <div className="mt-1 text-xs text-[var(--ink-secondary)]">فائدة وتقييد</div>
        </div>

        <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4">
          <div className="text-xs text-[var(--ink-muted)]">البطاقات المتقنة</div>
          <div className="mt-1 font-matn text-2xl font-bold text-[var(--accent-olive)] tabular-nums-ar">
            {toArabicDigits(state.masteredFlashcards.length)}/{toArabicDigits(FLASHCARDS.length)}
          </div>
          <div className="mt-1 text-xs text-[var(--ink-secondary)]">بطاقة استذكار</div>
        </div>
      </div>

      {/* Chapter Progress Grid */}
      <section className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5">
        <h2 className="mb-4 font-matn text-lg font-bold text-[var(--ink-primary)]">
          تتبع القراءة عبر أقسام المذكرة ({toArabicDigits(CHAPTERS.length)})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch) => {
            const done = ch.blocks.filter((b) => state.readBlocks.includes(b.id)).length;
            const pct = Math.round((done / Math.max(1, ch.blocks.length)) * 100);
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onJumpToReader(ch.id, ch.blocks[0]?.id ?? '')}
                className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-3 text-right hover:border-[var(--border-strong)] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[var(--ink-primary)]">
                  <span className="truncate">{ch.shortLabel}</span>
                  <span className="tabular-nums-ar text-[var(--accent-gold)]">
                    {toArabicDigits(pct)}٪
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
                  <div
                    className="h-full bg-[var(--accent-gold)]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Bookmarks & Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookmarks */}
        <section className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5">
          <h2 className="mb-4 font-matn text-lg font-bold text-[var(--ink-primary)]">
            الإشارات المرجعية ({toArabicDigits(state.bookmarks.length)})
          </h2>
          {state.bookmarks.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              لم تحفظ أي مسألة بعد؛ استخدم زر «حفظ» داخل القارئ التحقيقي.
            </p>
          ) : (
            <div className="space-y-3">
              {state.bookmarks.map((blockId) => {
                const found = findBlockById(blockId);
                if (!found) return null;
                return (
                  <div
                    key={blockId}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
                        {found.chapter.shortLabel} · ص{' '}
                        {toArabicDigits(found.block.pageNumber)}
                      </div>
                      <div className="truncate font-matn text-base font-bold text-[var(--ink-primary)]">
                        {found.block.title}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPreviewPdf(found.block.pageNumber)}
                        aria-label="معاينة صفحة الأصل"
                        className="rounded border border-[var(--border-hairline)] p-1.5 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onJumpToReader(found.chapter.id, found.block.id)}
                        className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--accent-gold-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-gold)] cursor-pointer"
                      >
                        <span>فتح</span>
                        <ArrowUpLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleBookmark(blockId)}
                        aria-label="إزالة الإشارة"
                        className="rounded border border-[var(--border-hairline)] p-1.5 text-[var(--ink-muted)] hover:text-[var(--accent-umber)] cursor-pointer"
                      >
                        <BookmarkX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Personal Notes */}
        <section className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5">
          <h2 className="mb-4 font-matn text-lg font-bold text-[var(--ink-primary)]">
            التعليقات والفوائد المدونة ({toArabicDigits(state.notes.length)})
          </h2>
          {state.notes.length === 0 ? (
            <p className="text-sm text-[var(--ink-muted)]">
              لا توجد ملاحظات مدونة بعد؛ اضغط «تدوين» أعلى أي مسألة لتقييد فوائدك.
            </p>
          ) : (
            <div className="space-y-3">
              {state.notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
                        ص {toArabicDigits(note.pageNumber)} ·{' '}
                        {new Date(note.updatedAt).toLocaleDateString('ar-EG')}
                      </div>
                      <h3 className="font-matn text-base font-bold text-[var(--ink-primary)]">
                        {note.blockTitle}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onJumpToReader(note.chapterId, note.blockId)}
                        className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] px-2 py-1 text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        <span>الموضع</span>
                        <ArrowUpLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label="حذف الملاحظة"
                        className="rounded border border-[var(--border-hairline)] p-1 text-[var(--ink-muted)] hover:text-[var(--accent-umber)] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--ink-primary)]">
                    {note.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
