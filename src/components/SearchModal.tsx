import { ArrowUpLeft, Eye, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CHAPTERS,
  QAIDAH_APPENDIX,
  TARJIH_APPENDIX,
  ZIYADA_APPENDIX,
} from '../data';
import {
  getSegmentBadgeLabel,
  normalizeArabic,
  toArabicDigits,
} from '../utils/arabic';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onJumpToReader: (chapterId: string, blockId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
}

type SearchScope = 'all' | 'matn' | 'sharh' | 'appendices';

interface SearchResult {
  id: string;
  chapterId: string;
  blockId: string;
  chapterLabel: string;
  title: string;
  badge: string;
  snippet: string;
  pageNumber: number;
}

export function SearchModal({
  open,
  onClose,
  onJumpToReader,
  onPreviewPdf,
}: SearchModalProps) {
  const [query, setQuery] = useState<string>('');
  const [scope, setScope] = useState<SearchScope>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo<SearchResult[]>(() => {
    const q = normalizeArabic(query);
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    if (scope !== 'appendices') {
      for (const ch of CHAPTERS) {
        for (const b of ch.blocks) {
          for (let i = 0; i < b.segments.length; i += 1) {
            const seg = b.segments[i];
            if (scope === 'matn' && seg.type !== 'matn') continue;
            if (scope === 'sharh' && seg.type === 'matn') continue;

            const combined = [
              b.title,
              seg.marginalNote ?? '',
              seg.text,
              seg.matnOpinion ?? '',
              seg.rajihOpinion ?? '',
              seg.dalilText ?? '',
            ].join(' ');

            if (normalizeArabic(combined).includes(q)) {
              out.push({
                id: `${b.id}-${i}`,
                chapterId: ch.id,
                blockId: b.id,
                chapterLabel: ch.shortLabel,
                title: b.title,
                badge: getSegmentBadgeLabel(seg.type, seg.label),
                snippet: (seg.rajihOpinion || seg.text).slice(0, 180),
                pageNumber: b.pageNumber,
              });
              break;
            }
          }
          if (out.length >= 30) break;
        }
        if (out.length >= 30) break;
      }
    }

    if (scope === 'all' || scope === 'appendices') {
      for (const t of TARJIH_APPENDIX) {
        if (normalizeArabic(`${t.location} ${t.matn} ${t.rajih}`).includes(q)) {
          out.push({
            id: `app-t-${t.num}`,
            chapterId: t.chapterId,
            blockId: t.blockId,
            chapterLabel: 'ثبت الترجيحات المخالفة',
            title: `الترجيح (${toArabicDigits(t.num)}): ${t.location}`,
            badge: 'ملحق الترجيحات',
            snippet: t.rajih,
            pageNumber: t.pageNumber,
          });
        }
      }
      for (const z of ZIYADA_APPENDIX) {
        if (normalizeArabic(`${z.location} ${z.topic}`).includes(q)) {
          out.push({
            id: `app-z-${z.num}`,
            chapterId: z.chapterId,
            blockId: z.blockId,
            chapterLabel: 'ثبت الزيادات',
            title: `زيادة (${toArabicDigits(z.num)}): ${z.location}`,
            badge: 'ملحق الزيادات',
            snippet: z.topic,
            pageNumber: z.pageNumber,
          });
        }
      }
      for (const r of QAIDAH_APPENDIX) {
        if (normalizeArabic(`${r.location} ${r.kind} ${r.text}`).includes(q)) {
          out.push({
            id: `app-q-${r.num}`,
            chapterId: r.chapterId,
            blockId: r.blockId,
            chapterLabel: 'ثبت القواعد والفوائد',
            title: `${r.kind} (${toArabicDigits(r.num)}): ${r.location}`,
            badge: 'ملحق القواعد',
            snippet: r.text,
            pageNumber: r.pageNumber,
          });
        }
      }
    }

    return out.slice(0, 40);
  }, [query, scope]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="البحث الفوري في شرح كتاب الطهارة"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-12 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--bg-paper)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--accent-gold)]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن حكم، حديث، ترجيح، زيادة، أو قاعدة (بلا تشكيل)..."
              className="flex-1 bg-transparent text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق البحث"
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(
              [
                ['all', 'الكل'],
                ['matn', 'المتن فقط'],
                ['sharh', 'الشرح والترجيحات'],
                ['appendices', 'الثبت والملاحق'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setScope(val)}
                className={`rounded-md border px-2.5 py-1 cursor-pointer ${
                  scope === val
                    ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] font-semibold text-[var(--accent-gold)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {normalizeArabic(query).length < 2 ? (
            <p className="py-8 text-center text-xs text-[var(--ink-muted)]">
              اكتب كلمتين أو حرفين على الأقل للبحث في ١١ قسماً وثبت الملاحق الثلاثة.
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-xs text-[var(--ink-muted)]">
              لم يُعثر على نتائج مطابقة لـ «{query}».
            </p>
          ) : (
            results.map((res) => (
              <div
                key={res.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-3 hover:border-[var(--border-strong)]"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--ink-muted)] tabular-nums-ar">
                    <span className="font-semibold text-[var(--accent-gold)]">
                      {res.badge}
                    </span>
                    <span>·</span>
                    <span>{res.chapterLabel}</span>
                    <span>·</span>
                    <span>ص {toArabicDigits(res.pageNumber)}</span>
                  </div>
                  <div className="font-matn text-base font-bold text-[var(--ink-primary)]">
                    {res.title}
                  </div>
                  <p className="line-clamp-2 text-xs text-[var(--ink-secondary)]">
                    {res.snippet}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onPreviewPdf(res.pageNumber);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2 py-1 text-xs text-[var(--ink-secondary)] cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    <span>الأصل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onJumpToReader(res.chapterId, res.blockId);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--accent-gold-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-gold)] cursor-pointer"
                  >
                    <span>فتح</span>
                    <ArrowUpLeft className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
