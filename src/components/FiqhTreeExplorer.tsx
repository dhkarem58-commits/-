import {
  ArrowUpLeft,
  ChevronDown,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CHAPTERS } from '../data';
import type { TreeNode, TreeNodeCategory } from '../types/fiqh';
import { toArabicDigits } from '../utils/arabic';

interface FiqhTreeExplorerProps {
  selectedChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onJumpToReader: (chapterId: string, blockId: string) => void;
  onPreviewPdf: (pageNumber: number) => void;
  readBlocks: string[];
}

function getCategoryStyle(category: TreeNodeCategory): {
  label: string;
  accent: string;
  bg: string;
} {
  switch (category) {
    case 'root':
      return {
        label: 'أصل الباب',
        accent: 'var(--accent-gold)',
        bg: 'var(--accent-gold-bg)',
      };
    case 'pillar':
      return {
        label: 'ركن / فرض',
        accent: 'var(--accent-gold)',
        bg: 'var(--bg-elevated)',
      };
    case 'condition':
      return {
        label: 'شرط / ضابط',
        accent: 'var(--accent-bronze)',
        bg: 'var(--accent-bronze-bg)',
      };
    case 'tarjih':
      return {
        label: 'ترجيح',
        accent: 'var(--accent-olive)',
        bg: 'var(--accent-olive-bg)',
      };
    case 'nullifier':
      return {
        label: 'ناقض / محرم',
        accent: 'var(--accent-umber)',
        bg: 'var(--accent-umber-bg)',
      };
    case 'sunnah':
      return {
        label: 'سنة / أدب',
        accent: 'var(--accent-olive)',
        bg: 'var(--bg-elevated)',
      };
    case 'ruling':
    default:
      return {
        label: 'حكم ومسألة',
        accent: 'var(--ink-primary)',
        bg: 'var(--bg-elevated)',
      };
  }
}

export function FiqhTreeExplorer({
  selectedChapterId,
  onSelectChapter,
  onJumpToReader,
  onPreviewPdf,
  readBlocks,
}: FiqhTreeExplorerProps) {
  const chapter = CHAPTERS.find((c) => c.id === selectedChapterId) ?? CHAPTERS[0];
  const [selectedNode, setSelectedNode] = useState<TreeNode>(chapter.tree);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const set = new Set<string>([chapter.tree.id]);
    for (const c of chapter.tree.children ?? []) set.add(c.id);
    return set;
  });

  useEffect(() => {
    setSelectedNode(chapter.tree);
    const next = new Set<string>([chapter.tree.id]);
    for (const c of chapter.tree.children ?? []) next.add(c.id);
    setExpandedIds(next);
  }, [chapter]);

  const toggleExpand = (nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    const walk = (n: TreeNode) => {
      all.add(n.id);
      n.children?.forEach(walk);
    };
    walk(chapter.tree);
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds(new Set([chapter.tree.id]));
  };

  const selectedStyle = getCategoryStyle(selectedNode.category);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10">
      {/* Chapter Horizontal Selector */}
      <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2">
        {CHAPTERS.map((ch) => {
          const active = ch.id === chapter.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onSelectChapter(ch.id)}
              className={`whitespace-nowrap shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'border-[var(--border-strong)] bg-[var(--accent-gold-bg)] font-bold text-[var(--accent-gold)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {ch.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        {/* Interactive Tree */}
        <section className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3">
            <div>
              <h1 className="headline-balance font-matn text-xl font-bold text-[var(--ink-primary)] sm:text-2xl">
                التشجير الفقهي: {chapter.shortLabel}
              </h1>
              <p className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
                ص {toArabicDigits(chapter.pageRange[0])}–{toArabicDigits(chapter.pageRange[1])}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                بسط الكل
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="rounded border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-2.5 py-1 text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
              >
                طي الفروع
              </button>
            </div>
          </div>

          <TreeBranch
            node={chapter.tree}
            depth={0}
            selectedId={selectedNode.id}
            expandedIds={expandedIds}
            readBlocks={readBlocks}
            onSelect={setSelectedNode}
            onToggleExpand={toggleExpand}
          />
        </section>

        {/* Inspector Panel */}
        <aside className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-elevated)] p-5 h-fit lg:sticky lg:top-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
            <span
              className="text-xs font-bold"
              style={{ color: selectedStyle.accent }}
            >
              {selectedStyle.label}
            </span>
            <span className="text-xs text-[var(--ink-muted)] tabular-nums-ar">
              صفحة {toArabicDigits(selectedNode.pageNumber)}
            </span>
          </div>

          <h2 className="headline-balance font-matn text-xl font-bold text-[var(--ink-primary)]">
            {selectedNode.label}
          </h2>
          {selectedNode.sublabel && (
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              {selectedNode.sublabel}
            </p>
          )}

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--ink-primary)]">
            <p>{selectedNode.summary}</p>

            {selectedNode.matnQuote && (
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-gold-bg)] p-3">
                <div className="mb-1 text-xs font-semibold text-[var(--accent-gold)]">
                  نص المتن
                </div>
                <p className="font-matn text-base">{selectedNode.matnQuote}</p>
              </div>
            )}

            {selectedNode.tarjihNote && (
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--accent-olive-bg)] p-3">
                <div className="mb-1 text-xs font-semibold text-[var(--accent-olive)]">
                  ترجيح الشارح
                </div>
                <p className="text-xs leading-relaxed text-[var(--ink-primary)]">
                  {selectedNode.tarjihNote}
                </p>
              </div>
            )}

            {selectedNode.dalil && (
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
                <div className="mb-1 text-xs font-semibold text-[var(--ink-secondary)]">
                  الدليل والتعليل
                </div>
                <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
                  {selectedNode.dalil}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--border-hairline)] pt-4">
            <button
              type="button"
              onClick={() => onJumpToReader(chapter.id, selectedNode.blockId)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--accent-gold)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 cursor-pointer"
            >
              <span>اقرأ المسألة في القارئ</span>
              <ArrowUpLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onPreviewPdf(selectedNode.pageNumber)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-paper)] px-3 py-2 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--border-strong)] cursor-pointer tabular-nums-ar"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>ص {toArabicDigits(selectedNode.pageNumber)}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TreeBranch({
  node,
  depth,
  selectedId,
  expandedIds,
  readBlocks,
  onSelect,
  onToggleExpand,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string;
  expandedIds: Set<string>;
  readBlocks: string[];
  onSelect: (node: TreeNode) => void;
  onToggleExpand: (nodeId: string) => void;
}) {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isRead = readBlocks.includes(node.blockId);
  const style = getCategoryStyle(node.category);

  return (
    <div className={depth > 0 ? 'mt-2 mr-4 sm:mr-6' : ''}>
      <div
        className={`flex items-center justify-between gap-2 rounded-md border p-3 transition-colors ${
          isSelected
            ? 'border-[var(--border-strong)]'
            : 'border-[var(--border-hairline)] hover:border-[var(--border-strong)]'
        }`}
        style={{ backgroundColor: isSelected ? style.bg : 'var(--bg-paper)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleExpand(node.id)}
              aria-label={isExpanded ? 'طي الفرع' : 'بسط الفرع'}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[var(--border-hairline)] bg-[var(--bg-elevated)] text-[var(--ink-secondary)] cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span className="inline-block w-6 shrink-0 text-center text-xs text-[var(--ink-muted)]">
              ○
            </span>
          )}

          <button
            type="button"
            onClick={() => onSelect(node)}
            className="min-w-0 flex-1 text-right cursor-pointer"
          >
            <div className="font-matn text-base font-bold text-[var(--ink-primary)]">
              {node.label}
            </div>
            {node.sublabel && (
              <div className="text-xs text-[var(--ink-muted)]">{node.sublabel}</div>
            )}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-[11px] tabular-nums-ar text-[var(--ink-muted)]">
          {isRead && <span className="text-[var(--accent-olive)] font-medium">مقروء</span>}
          <span>ص {toArabicDigits(node.pageNumber)}</span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2 border-r border-dashed border-[var(--border-hairline)] pr-2">
          {node.children!.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              readBlocks={readBlocks}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
