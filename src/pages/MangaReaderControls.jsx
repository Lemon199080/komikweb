import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Settings, Play, List, Home } from 'lucide-react';
import SettingsComponent from './Settings';

export default function MangaReaderControls({
  showUI,
  setShowUI,
  resetUiTimer,
  goToPreviousChapter,
  goToNextChapter,
  goToComicPage,
  setShowChapterDropdown,
  currentChapterIndex,
  chapterList,
}) {
  const [isVisible, setIsVisible] = useState(showUI);
  const [showSettings, setShowSettings] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    setIsVisible(showUI);
  }, [showUI]);

  useEffect(() => {
    let timer;
    const movementThreshold = 30; // 30px for swipe detection
    const timeThreshold = 300; // 300ms for fast swipe

    const handlePointerDown = (e) => {
      const { clientX, clientY } = e.touches ? e.touches[0] : e;
      setTouchStart({ x: clientX, y: clientY, time: Date.now() });
    };

    const handlePointerUp = (e) => {
      if (e.target.closest('button')) return;

      const { clientX, clientY } = e.changedTouches ? e.changedTouches[0] : e;
      const dx = clientX - touchStart.x;
      const dy = clientY - touchStart.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = Date.now() - touchStart.time;

      if (distance > movementThreshold && elapsed < timeThreshold) {
        if (!showUI) {
          setShowUI(true);
          setIsVisible(true);
        }
        resetUiTimer();
      } else if (distance < movementThreshold && elapsed < 500) {
        setShowUI((prev) => !prev);
        setIsVisible((prev) => !prev);
      }
    };

    if (showUI) {
      timer = setTimeout(() => {
        setShowUI(false);
        setIsVisible(false);
      }, 3000);
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [showUI, resetUiTimer, setShowUI, touchStart]);

  const handleSettingsToggle = useCallback((e) => {
    e.stopPropagation();
    setShowSettings((prev) => !prev);
  }, []);

  const isFirstChapter = currentChapterIndex <= 0;
  const isLastChapter = currentChapterIndex >= chapterList.length - 1;

  return (
    <div role="region" aria-label="Manga reader controls" className="pointer-events-none">
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <nav className="flex items-center gap-4 px-6 py-3 bg-black/70 backdrop-blur-sm rounded-full shadow-lg">
          <ControlButton
            onClick={goToPreviousChapter}
            disabled={isFirstChapter}
            ariaLabel="Previous Chapter"
            icon={<ChevronLeft className="w-5 h-5" />}
          />
          <ControlButton
            onClick={() => setShowChapterDropdown((prev) => !prev)}
            ariaLabel="Chapter List"
            icon={<List className="w-5 h-5" />}
          />
          <ControlButton
            onClick={() => alert('Auto-scroll not implemented')}
            ariaLabel="Auto Scroll"
            icon={<Play className="w-5 h-5" />}
          />
          <ControlButton
            onClick={handleSettingsToggle}
            ariaLabel="Toggle Settings"
            icon={<Settings className="w-5 h-5" />}
          />
          {isLastChapter ? (
            <ControlButton
              onClick={goToComicPage}
              ariaLabel="Home"
              icon={<Home className="w-5 h-5" />}
            />
          ) : (
            <ControlButton
              onClick={goToNextChapter}
              disabled={isLastChapter}
              ariaLabel="Next Chapter"
              icon={<ChevronRight className="w-5 h-5" />}
            />
          )}
        </nav>
      </div>

      {showSettings && (
        <SettingsComponent onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

const ControlButton = ({ onClick, disabled, ariaLabel, icon }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    disabled={disabled}
    className={`p-2 rounded-full transition-colors ${
      disabled
        ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
        : 'hover:bg-black/90 focus:ring-2 focus:ring-white/50'
    }`}
    aria-label={ariaLabel}
    type="button"
  >
    {icon}
  </button>
);