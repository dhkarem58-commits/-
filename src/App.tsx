import { useEffect, useMemo, useState } from 'react';
import { AppendicesView } from './components/AppendicesView';
import { CriticalReader } from './components/CriticalReader';
import { FiqhTreeExplorer } from './components/FiqhTreeExplorer';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { SearchModal } from './components/SearchModal';
import { StudentNotebook } from './components/StudentNotebook';
import { StudyCenter } from './components/StudyCenter';
import { TopBar } from './components/TopBar';
import {
  CHAPTERS,
  TARJIH_APPENDIX,
  TOTAL_PDF_PAGES,
} from './data';
import { useStudyState } from './hooks/useStudyState';
import type { AppView } from './types/fiqh';
import { toArabicDigits } from './utils/arabic';

export function App() {
  const [activeView, setActiveView] = useState<AppView>('reader');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('ch-00-tamhid');
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [pdfPreviewPage, setPdfPreviewPage] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const {
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
  } = useStudyState();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const stats = useMemo(() => {
    const totalBlocks = CHAPTERS.reduce((sum, ch) => sum + ch.blocks.length, 0);
    const readPct = Math.round(
      (state.readBlocks.length / Math.max(1, totalBlocks)) * 100
    );
    return { totalBlocks, readPct };
  }, [state.readBlocks.length]);

  const handleJumpToReader = (chapterId: string, blockId: string) => {
    setSelectedChapterId(chapterId);
    setFocusedBlockId(blockId || null);
    setActiveView('reader');
  };

  const handleJumpToTree = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveView('tree');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-paper)] text-[var(--ink-primary)]">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Scholarly Overview Strip */}
      <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-elevated)]">
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[var(--ink-secondary)]">
              <span className="font-matn text-sm font-bold text-[var(--ink-primary)]">
                شرح كتاب الطهارة من «الفقه الميسر» — الشيخ محمد حمدي
              </span>
              <span aria-hidden="true">·</span>
              <span>تحقيق المتن والشرح والترجيحات والزيادات والقواعد</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 tabular-nums-ar text-[var(--ink-secondary)]">
              <span>
                الأقسام:{' '}
                <strong className="text-[var(--ink-primary)]">
                  {toArabicDigits(CHAPTERS.length)}
                </strong>
              </span>
              <span>
                صفحات الأصل:{' '}
                <strong className="text-[var(--ink-primary)]">
                  {toArabicDigits(TOTAL_PDF_PAGES)}
                </strong>
              </span>
              <span>
                الترجيحات المخالفة:{' '}
                <strong className="text-[var(--accent-olive)]">
                  {toArabicDigits(TARJIH_APPENDIX.length)}
                </strong>
              </span>
              <span>
                الإنجاز:{' '}
                <strong className="text-[var(--accent-gold)]">
                  {toArabicDigits(stats.readPct)}٪
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Active Workspace */}
      <main className="flex-1">
        {activeView === 'reader' && (
          <CriticalReader
            selectedChapterId={selectedChapterId}
            focusedBlockId={focusedBlockId}
            onSelectChapter={(chId) => {
              setSelectedChapterId(chId);
              setFocusedBlockId(null);
            }}
            onJumpToTree={handleJumpToTree}
            onPreviewPdf={setPdfPreviewPage}
            preferences={state.preferences}
            onToggleLayer={toggleLayer}
            onSetMatnOnly={setMatnOnlyMode}
            onToggleMarginalNotes={toggleMarginalNotes}
            onToggleFootnotes={toggleFootnotes}
            onSetFontSize={setFontSize}
            onToggleDarkMode={toggleDarkMode}
            readBlocks={state.readBlocks}
            bookmarks={state.bookmarks}
            notes={state.notes}
            onToggleRead={toggleReadBlock}
            onToggleBookmark={toggleBookmark}
            onSaveNote={saveNote}
          />
        )}

        {activeView === 'tree' && (
          <FiqhTreeExplorer
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            onJumpToReader={handleJumpToReader}
            onPreviewPdf={setPdfPreviewPage}
            readBlocks={state.readBlocks}
          />
        )}

        {activeView === 'appendices' && (
          <AppendicesView
            onJumpToReader={handleJumpToReader}
            onPreviewPdf={setPdfPreviewPage}
          />
        )}

        {activeView === 'study' && (
          <StudyCenter
            masteredFlashcards={state.masteredFlashcards}
            reviewFlashcards={state.reviewFlashcards}
            quizScores={state.quizScores}
            onMarkFlashcard={markFlashcard}
            onRecordQuizScore={recordQuizScore}
            onJumpToReader={handleJumpToReader}
            onPreviewPdf={setPdfPreviewPage}
          />
        )}

        {activeView === 'notebook' && (
          <StudentNotebook
            state={state}
            onJumpToReader={handleJumpToReader}
            onPreviewPdf={setPdfPreviewPage}
            onDeleteNote={deleteNote}
            onToggleBookmark={toggleBookmark}
            onImportJson={importStateJson}
            onResetProgress={resetProgress}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)] py-5">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 text-xs text-[var(--ink-muted)] sm:px-6 lg:px-10">
          <span>
            شرح كتاب الطهارة من «الفقه الميسر» — الشيخ محمد حمدي · ١٢٨ صفحة
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setPdfPreviewPage(1)}
              className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:underline cursor-pointer"
            >
              معاينة الغلاف (ص ١)
            </button>
            <button
              type="button"
              onClick={() => setPdfPreviewPage(120)}
              className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:underline cursor-pointer"
            >
              ملحق الترجيحات (ص ١٢٠)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PdfPreviewModal
        pageNumber={pdfPreviewPage}
        onClose={() => setPdfPreviewPage(null)}
        onChangePage={setPdfPreviewPage}
      />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onJumpToReader={handleJumpToReader}
        onPreviewPdf={setPdfPreviewPage}
      />
    </div>
  );
}

export default App;
