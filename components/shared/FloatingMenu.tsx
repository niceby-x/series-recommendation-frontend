'use client';

import { useLayoutEffect, useState, type RefObject, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Renders open dropdown/popover content into a portal at document.body,
// positioned with `position: fixed` against `anchorRef`'s live bounding
// rect. This is what lets a menu escape an ancestor's `overflow-hidden`
// (e.g. a grid card's rounded poster mask) or `overflow-x-auto` (which
// forces the other axis to clip too, per the same CSS quirk behind the
// ScrollRow hover-clip fix) -- without a portal, the menu either gets cut
// off at the ancestor's edge or paints underneath neighboring siblings
// instead of floating above everything.
export function FloatingMenu({
  open,
  anchorRef,
  menuRef,
  align = 'end',
  className = '',
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  // 'end' aligns the menu's right edge to the anchor's right edge (dropdowns
  // opening from a right-side trigger, e.g. row actions); 'start' aligns
  // left edges (e.g. a status chip near the left of a row).
  align?: 'start' | 'end';
  className?: string;
  children: ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: align === 'end' ? rect.right : rect.left });
    }

    update();
    // capture: true so this also fires for scrolling inside a nested
    // scroll container (e.g. the admin table's overflow-x-auto wrapper),
    // not just window-level scroll.
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef, align]);

  if (!open || !coords || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: coords.top, left: coords.left, transform: align === 'end' ? 'translateX(-100%)' : undefined }}
      className={'z-50 ' + className}
    >
      {children}
    </div>,
    document.body
  );
}
