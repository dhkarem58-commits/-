import { ChevronLeft, ChevronRight, ExternalLink, Minus, Plus, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';
import { PDF_ASSET_URL, TOTAL_PDF_PAGES } from '../data';
import { toArabicDigits } from '../utils/arabic';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfPreviewModalProps {
  pageNumber: number | null;
  onClose: () => void;
  onChangePage: (page: number) => void;
}

function parseArabicOrWesternPage(raw: string): number | null {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const ascii = raw.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
  const num = Number.parseInt(ascii.trim(), 10);
  if (Number.isNaN(num)) return null;
  return Math.max(1, Math.min(TOTAL_PDF_PAGES, num));
}

export function PdfPreviewModal({
  pageNumber,
  onClose,
  onChangePage,
}: PdfPreviewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState<number>(1.25);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jumpInput, setJumpInput] = useState<string>('');
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (pageNumber !== null) {
      setJumpInput(String(pageNumber));
    }
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && pageNumber < TOTAL_PDF_PAGES) {
        onChangePage(pageNumber + 1);
      }
      if (e.key === 'ArrowRight' && pageNumber > 1) {
        onChangePage(pageNumber - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pageNumber, onClose, onChangePage]);

  useEffect(() => {
    if (pageNumber === null) return;
    let cancelled = false;
    let activeRenderTask: pdfjsLib.RenderTask | null = null;

    async function renderPage() {
      if (pageNumber === null) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        if (!pdfDocRef.current) {
          const loadingTask = pdfjsLib.getDocument({ url: PDF_ASSET_URL });
          pdfDocRef.current = await loadingTask.promise;
        }
        if (cancelled) return;
        const clamped = Math.max(1, Math.min(TOTAL_PDF_PAGES, pageNumber));
        const page = await pdfDocRef.current.getPage(clamped);
        if (cancelled || !canvasRef.current) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        activeRenderTask = page.render({
          canvasContext: context,
          canvas,
          viewport,
        });
        await activeRenderTask.promise;
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setErrorMsg(
            err instanceof Error ? err.message : 'تعذر تحميل صفحة الكتاب الأصلية.'
          );
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      if (activeRenderTask) {
        try {
          activeRenderTask.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pageNumber, scale]);

  if (pageNumber === null) return null;

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseArabicOrWesternPage(jumpInput);
    if (parsed !== null) {
      onChangePage(parsed);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`معاينة الصفحة ${pageNumber} من الملف الأصلي`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-paper)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-matn text-lg font-bold text-[var(--ink-primary)]">
              عارض صفحات المذكرة الأصلية
            </h2>
            <span className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
              صفحة {toArabicDigits(pageNumber)} من {toArabicDigits(TOTAL_PDF_PAGES)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Page Jump */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <label htmlFor="pdf-page-jump" className="sr-only">
                رقم الصفحة
              </label>
              <input
                id="pdf-page-jump"
                type="text"
                inputMode="numeric"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="h-8 w-14 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2 text-center text-xs text-[var(--ink-primary)] tabular-nums-ar"
              />
              <button
                type="submit"
                className="h-8 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer"
              >
                انتقال
              </button>
            </form>

            {/* Page Navigation */}
            <div className="flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-0.5">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => onChangePage(pageNumber - 1)}
                aria-label="الصفحة السابقة"
                className="inline-flex h-7 items-center gap-1 rounded px-2 text-xs text-[var(--ink-primary)] disabled:opacity-40 hover:bg-[var(--bg-surface)] cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span>السابقة</span>
              </button>
              <span className="px-2 text-xs font-medium tabular-nums-ar text-[var(--ink-secondary)]">
                {toArabicDigits(pageNumber)}
              </span>
              <button
                type="button"
                disabled={pageNumber >= TOTAL_PDF_PAGES}
                onClick={() => onChangePage(pageNumber + 1)}
                aria-label="الصفحة التالية"
                className="inline-flex h-7 items-center gap-1 rounded px-2 text-xs text-[var(--ink-primary)] disabled:opacity-40 hover:bg-[var(--bg-surface)] cursor-pointer disabled:cursor-not-allowed"
              >
                <span>التالية</span>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.75, Number((s - 0.2).toFixed(2))))}
                aria-label="تصغير الصفحة"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2, Number((s + 0.2).toFixed(2))))}
                aria-label="تكبير الصفحة"
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <a
              href={`${PDF_ASSET_URL}#page=${pageNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>فتح الملف</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق المعاينة"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-primary)] hover:bg-[var(--bg-surface)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 overflow-auto bg-[var(--bg-surface)] p-4 sm:p-6">
          {loading && (
            <div className="mb-3 text-center text-xs text-[var(--ink-muted)]">
              جاري رسم صفحة الأصل بدقة عالية...
            </div>
          )}
          {errorMsg ? (
            <div className="mx-auto max-w-md rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] p-6 text-center">
              <p className="text-sm text-[var(--accent-umber)] font-medium">{errorMsg}</p>
              <a
                href={`${PDF_ASSET_URL}#page=${pageNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--ink-primary)] px-4 py-2 text-xs font-medium text-[var(--ink-primary)]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>فتح ملف PDF مباشرة</span>
              </a>
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                className="rounded border border-[var(--border-hairline)] bg-white shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
