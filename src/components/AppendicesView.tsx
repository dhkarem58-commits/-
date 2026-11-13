import { ArrowUpLeft, BookOpen, Eye, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CHAPTERS, QAIDAH_APPENDIX, TARJIH_APPENDIX, ZIYADA_APPENDIX } from '../data';
import type { QaidahKind } from '../types/fiqh';
import { normalizeArabic, toArabicDigits } from '../utils/arabic';

interface AppendicesViewProps {
  onJumpToReader: (chapterId: string, blockId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
}

type AppendixTab = 'tarjih' | 'ziyada' | 'qaidah';

const QAIDAH_KINDS: ('الكل' | QaidahKind)[] = [
  'الكل',
  'قاعدة',
  'قاعدة منهجية',
  'تعريف',
  'فائدة اصطلاحية',
  'فائدة لغوية',
];

export function AppendicesView({
  onJumpToReader,
  onPreviewPdf,
}: AppendicesViewProps) {
  const [activeTab, setActiveTab] = useState<AppendixTab>('tarjih');
  const [query, setQuery] = useState<string>('');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<'الكل' | QaidahKind>('الكل');

  const normQuery = useMemo(() => normalizeArabic(query), [query]);

  const chapterTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const ch of CHAPTERS) {
      map.set(ch.id, ch.shortLabel);
    }
    return map;
  }, []);

  const filteredTarjih = useMemo(() => {
    return TARJIH_APPENDIX.filter((row) => {
      if (chapterFilter !== 'all' && row.chapterId !== chapterFilter) return false;
      if (!normQuery) return true;
      const hay = normalizeArabic(
        `${row.location} ${row.matn} ${row.rajih} ${toArabicDigits(row.num)}`
      );
      return hay.includes(normQuery);
    });
  }, [chapterFilter, normQuery]);

  const filteredZiyada = useMemo(() => {
    return ZIYADA_APPENDIX.filter((row) => {
      if (chapterFilter !== 'all' && row.chapterId !== chapterFilter) return false;
      if (!normQuery) return true;
      const hay = normalizeArabic(
        `${row.location} ${row.topic} ${toArabicDigits(row.num)}`
      );
      return hay.includes(normQuery);
    });
  }, [chapterFilter, normQuery]);

  const filteredQaidah = useMemo(() => {
    return QAIDAH_APPENDIX.filter((row) => {
      if (chapterFilter !== 'all' && row.chapterId !== chapterFilter) return false;
      if (kindFilter !== 'الكل' && row.kind !== kindFilter) return false;
      if (!normQuery) return true;
      const hay = normalizeArabic(
        `${row.location} ${row.kind} ${row.text} ${toArabicDigits(row.num)}`
      );
      return hay.includes(normQuery);
    });
  }, [chapterFilter, kindFilter, normQuery]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <h1 className="headline-balance font-matn text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
            ثبت الملاحق الفقهية والأصولية
          </h1>
          <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
            فهرس تحليلي موثق بأرقام الصفحات لما خالف فيه الشارحُ المتنَ، والزيادات الفقهية، والقواعد والتعريفات (ص ١٢٠–١٢٧).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewPdf(120)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>ملحق الترجيحات (ص ١٢٠)</span>
          </button>
          <button
            type="button"
            onClick={() => onPreviewPdf(123)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>ملحق الزيادات (ص ١٢٣)</span>
          </button>
          <button
            type="button"
            onClick={() => onPreviewPdf(125)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>ملحق القواعد (ص ١٢٥)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('tarjih')}
          className={`whitespace-nowrap shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer tabular-nums-ar ${
            activeTab === 'tarjih'
              ? 'border-[var(--border-strong)] bg-[var(--accent-olive-bg)] text-[var(--accent-olive)]'
              : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          ثبت الترجيحات المخالفة للمتن ({toArabicDigits(TARJIH_APPENDIX.length)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ziyada')}
          className={`whitespace-nowrap shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer tabular-nums-ar ${
            activeTab === 'ziyada'
              ? 'border-[var(--border-strong)] bg-[var(--accent-umber-bg)] text-[var(--accent-umber)]'
              : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          ثبت الزيادات على المتن ({toArabicDigits(ZIYADA_APPENDIX.length)})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('qaidah')}
          className={`whitespace-nowrap shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer tabular-nums-ar ${
            activeTab === 'qaidah'
              ? 'border-[var(--border-strong)] bg-[var(--accent-bronze-bg)] text-[var(--accent-bronze)]'
              : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
          }`}
        >
          ثبت القواعد والتعريفات والفوائد ({toArabicDigits(QAIDAH_APPENDIX.length)})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 grid gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث داخل الثبت بالموضوع أو القول أو رقم المسألة..."
            aria-label="بحث داخل الثبت"
            className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] py-2 pr-9 pl-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)]"
          />
        </div>

        <select
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          aria-label="تصفية حسب الباب"
          className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink-primary)]"
        >
          <option value="all">جميع الأقسام والأبواب</option>
          {CHAPTERS.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.shortLabel}
            </option>
          ))}
        </select>

        {activeTab === 'qaidah' && (
          <div className="flex flex-wrap items-center gap-1.5 md:col-span-2">
            {QAIDAH_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
                className={`whitespace-nowrap shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer ${
                  kindFilter === kind
                    ? 'border-[var(--border-strong)] bg-[var(--accent-bronze-bg)] text-[var(--accent-bronze)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Tarjihat */}
      {activeTab === 'tarjih' && (
        <div className="space-y-4">
          {filteredTarjih.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-8 text-center text-sm text-[var(--ink-muted)]">
              لا توجد ترجيحات مطابقة لمعايير البحث الحالية.
            </div>
          ) : (
            filteredTarjih.map((row) => (
              <article
                key={row.num}
                className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-[var(--accent-olive)] tabular-nums-ar">
                      الترجيح ({toArabicDigits(row.num)})
                    </span>
                    <span className="text-[var(--ink-muted)]">·</span>
                    <span className="font-semibold text-[var(--ink-primary)]">
                      {row.location}
                    </span>
                    <span className="text-[var(--ink-muted)]">·</span>
                    <span className="text-xs text-[var(--ink-muted)]">
                      {chapterTitleMap.get(row.chapterId)} · ص {toArabicDigits(row.pageNumber)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewPdf(row.pageNumber)}
                      className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-xs text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer tabular-nums-ar"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>ص {toArabicDigits(row.pageNumber)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onJumpToReader(row.chapterId, row.blockId)}
                      className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--accent-olive-bg)] px-2.5 py-1 text-xs font-medium text-[var(--accent-olive)] hover:opacity-90 cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>فتح في القارئ</span>
                      <ArrowUpLeft className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-gold-bg)] p-3.5">
                    <div className="mb-1 text-xs font-semibold text-[var(--accent-gold)]">
                      ما ذُكر في المتن
                    </div>
                    <p className="font-matn text-base leading-relaxed text-[var(--ink-primary)]">
                      {row.matn}
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-olive-bg)] p-3.5">
                    <div className="mb-1 text-xs font-semibold text-[var(--accent-olive)]">
                      الراجح الذي اختاره الشارح
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-[var(--ink-primary)]">
                      {row.rajih}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Ziyadat */}
      {activeTab === 'ziyada' && (
        <div className="space-y-3">
          {filteredZiyada.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-8 text-center text-sm text-[var(--ink-muted)]">
              لا توجد زيادات مطابقة لمعايير البحث الحالية.
            </div>
          ) : (
            filteredZiyada.map((row) => (
              <article
                key={row.num}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <span className="font-bold text-[var(--accent-umber)] tabular-nums-ar">
                      زيادة ({toArabicDigits(row.num)})
                    </span>
                    <span>·</span>
                    <span className="font-medium text-[var(--ink-secondary)]">
                      {row.location}
                    </span>
                    <span>·</span>
                    <span>{chapterTitleMap.get(row.chapterId)}</span>
                    <span>·</span>
                    <span className="tabular-nums-ar">ص {toArabicDigits(row.pageNumber)}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[var(--ink-primary)]">
                    {row.topic}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewPdf(row.pageNumber)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer tabular-nums-ar"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>صفحة الأصل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToReader(row.chapterId, row.blockId)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--accent-umber-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent-umber)] hover:opacity-90 cursor-pointer"
                  >
                    <span>الموضع</span>
                    <ArrowUpLeft className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Qawaid */}
      {activeTab === 'qaidah' && (
        <div className="space-y-3">
          {filteredQaidah.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-8 text-center text-sm text-[var(--ink-muted)]">
              لا توجد قواعد أو فوائد مطابقة لمعايير البحث الحالية.
            </div>
          ) : (
            filteredQaidah.map((row) => (
              <article
                key={row.num}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
                    <span className="font-bold text-[var(--accent-bronze)] tabular-nums-ar">
                      {row.kind} ({toArabicDigits(row.num)})
                    </span>
                    <span>·</span>
                    <span className="font-medium text-[var(--ink-secondary)]">
                      {row.location}
                    </span>
                    <span>·</span>
                    <span>{chapterTitleMap.get(row.chapterId)}</span>
                    <span>·</span>
                    <span className="tabular-nums-ar">ص {toArabicDigits(row.pageNumber)}</span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-[var(--ink-primary)]">
                    {row.text}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewPdf(row.pageNumber)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer tabular-nums-ar"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>صفحة الأصل</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToReader(row.chapterId, row.blockId)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--border-strong)] bg-[var(--accent-bronze-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--accent-bronze)] hover:opacity-90 cursor-pointer"
                  >
                    <span>الموضع</span>
                    <ArrowUpLeft className="h-3 w-3" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
