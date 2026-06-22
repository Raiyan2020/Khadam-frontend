import { useRef, useCallback } from 'react';
import React from 'react';

/**
 * Hook that makes a horizontally-scrollable container draggable with the mouse.
 * A small drag threshold (5 px) prevents accidental suppression of click events
 * on child buttons.
 *
 * Usage:
 *   const { ref, dragProps, preventClickIfDragged } = useDragScroll<HTMLDivElement>();
 *   <div ref={ref} {...dragProps} className="overflow-x-auto cursor-grab select-none">
 *     <button onClick={preventClickIfDragged(() => doSomething())}>Click me</button>
 *   </div>
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistance = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = x - startX.current;
    dragDistance.current = Math.abs(walk);
    el.scrollLeft = scrollLeftRef.current - walk;
  }, []);

  const stopDrag = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = 'grab';
    el.style.userSelect = '';
  }, []);

  /**
   * Wrap an onClick handler so that a drag gesture (>5 px movement) doesn't
   * accidentally fire a click.
   */
  const preventClickIfDragged = useCallback((handler: () => void) => {
    return () => {
      if (dragDistance.current > 5) return;
      handler();
    };
  }, []);

  /** Spread these onto the container element. */
  const dragProps = {
    onMouseDown,
    onMouseMove,
    onMouseUp: stopDrag,
    onMouseLeave: stopDrag,
  } as const;

  return { ref, dragProps, preventClickIfDragged };
}
