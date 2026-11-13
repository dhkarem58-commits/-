import { Search } from 'lucide-react';
import type { AppView } from '../types/fiqh';

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenSearch: () => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'reader', label: 'القارئ التحقيقي' },
  { id: 'tree', label: 'التشجيرات' },
  { id: 'appendices', label: 'الثبت والملاحق' },
  { id: 'study', label: 'المراجعة والاختبارات' },
  { id: 'notebook', label: 'مذكرة الطالب' },
];

export function TopBar({ activeView, onSelectView, onOpenSearch }: TopBarProps) {
  return (
    <header className="border-b border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:flex-nowrap lg:gap-8 lg:px-10">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('reader')}
          className="whitespace-nowrap font-matn text-lg font-bold tracking-tight text-[var(--ink-primary)] hover:text-[var(--accent-gold)] transition-colors cursor-pointer"
        >
          شرح الطهارة · الفقه الميسر
        </button>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="flex flex-wrap items-center gap-1 sm:gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-gold-bg)] text-[var(--accent-gold)] border border-[var(--border-strong)]'
                    : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--ink-primary)] border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary CTA */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="inline-flex whitespace-nowrap shrink-0 items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span>البحث الشامل</span>
          <span className="hidden opacity-80 sm:inline font-mono text-[11px]">Ctrl+K</span>
        </button>
      </div>
    </header>
  );
}
