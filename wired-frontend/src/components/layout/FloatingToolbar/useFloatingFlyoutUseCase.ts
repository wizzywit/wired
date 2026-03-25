import { useCallback, useEffect, useRef, useState } from 'react';

type UseFloatingFlyoutUseCaseInput = {
  closeDelayMs?: number;
};

export function useFloatingFlyoutUseCase({ closeDelayMs = 200 }: UseFloatingFlyoutUseCaseInput = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeMenu();
      closeTimerRef.current = null;
    }, closeDelayMs);
  }, [clearCloseTimer, closeDelayMs, closeMenu]);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setMenuOpen(true);
  }, [clearCloseTimer]);

  const toggleMenu = useCallback(() => {
    clearCloseTimer();
    setMenuOpen((open) => !open);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocumentMouseDown = (event: MouseEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, [closeMenu, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [closeMenu, menuOpen]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  return {
    menuOpen,
    wrapRef,
    clearCloseTimer,
    scheduleClose,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}
