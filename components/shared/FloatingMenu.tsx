'use client';

import { useEffect, useLayoutEffect, useState, type RefObject, type ReactNode } from 'react';
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
  arrowClassName = 'bg-popover border-border/70',
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
  // Background + border-left/border-top classes for the connecting arrow --
  // needs to match whatever `className` sets as the menu box's own
  // background, or the arrow reads as a mismatched fragment rather than
  // part of the same shape. Defaults to the plain menu box's colors.
  arrowClassName?: string;
  children: ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  // Drives the fade+scale entrance: false on the first paint (so there's a
  // "closed" state to transition from), flipped true a frame later so the
  // browser actually animates instead of snapping straight to open.
  const [entered, setEntered] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset back to "not entered" the moment `open` flips to false, so the
  // next time this menu opens it starts from closed again instead of
  // skipping straight to the settled state. Adjusting state during render
  // (rather than inside an effect) is the sanctioned way to respond to a
  // prop change without an extra render-effect-render round trip --
  // react-hooks/set-state-in-effect flags a direct setState call in an
  // effect body for exactly this kind of reset.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setEntered(false);
  }

  useLayoutEffect(() => {
    if (!open) return;

    function update() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // +8 (not the trigger-hugging +4 this used before) leaves room for
      // the connecting arrow below to poke up above the menu box.
      setCoords({ top: rect.bottom + 8, left: align === 'end' ? rect.right : rect.left });
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

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open || !coords || typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{ position: 'fixed', top: coords.top, left: coords.left, transform: align === 'end' ? 'translateX(-100%)' : undefined }}
      className="z-50"
    >
      {/* A small rotated-square "arrow" whose bottom half sits behind the
          menu box below it (same DOM-order paint layering: both are
          positioned elements with z-index:auto, so the later one -- the
          box -- paints over the earlier one -- this arrow). Only the top
          point pokes out, reading as a caret pointing back at the trigger
          button instead of the menu looking like an unrelated floating box. */}
      <span
        aria-hidden
        className={'absolute -top-1 size-2.5 rotate-45 border-l border-t ' + arrowClassName + ' ' + (align === 'end' ? 'right-3' : 'left-3')}
      />
      <div
        ref={menuRef}
        className={
          'relative transition-[opacity,transform] duration-150 ease-out ' +
          (entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95') +
          ' ' + (align === 'end' ? 'origin-top-right' : 'origin-top-left') +
          ' ' + className
        }
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
