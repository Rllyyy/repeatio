import { useCallback, useEffect, useRef, useState } from "react";

// CSS
import "./useLineDrag.css";

export type TLineDragSide = "left" | "right";

// Distance in px the pointer has to travel before the interaction counts as a drag and not as a click
const DRAG_THRESHOLD = 4;

// Distance in px to the center of a circle that still counts as dropping on it (helps on touch devices)
const SNAP_DISTANCE = 32;

// Every circle that supports dragging has to provide these two attributes
const CIRCLE_SELECTOR = "[data-side][data-ident]";

type TDragState = {
  side: TLineDragSide;
  id: string;
  circle: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  clientX: number;
  clientY: number;
  moved: boolean;
  dropTargetId: string | null;
};

export type TDragLine = {
  circle: HTMLElement;
  clientX: number;
  clientY: number;
};

interface IUseLineDrag {
  onConnect: (leftId: string, rightId: string) => void;
  disabled?: boolean;
}

export function useLineDrag<T extends HTMLElement = HTMLDivElement>({ onConnect, disabled }: IUseLineDrag) {
  // Has to wrap both sides and has to be positioned because the drag line is placed on top of it
  const containerRef = useRef<T | null>(null);
  const [dragState, setDragState] = useState<TDragState | null>(null);

  // Keep the callback in a ref so the drag doesn't have to reattach its listeners on every render
  const onConnectRef = useRef(onConnect);
  useEffect(() => {
    onConnectRef.current = onConnect;
  });

  const handleCirclePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      // Ignore every button but the primary one (touch and pen always report 0)
      if (disabled || e.button !== 0) return;

      const side = e.currentTarget.dataset.side as TLineDragSide | undefined;
      const id = e.currentTarget.dataset.ident;

      if (!side || !id) return;

      setDragState({
        side,
        id,
        circle: e.currentTarget,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        clientX: e.clientX,
        clientY: e.clientY,
        moved: false,
        dropTargetId: null,
      });
    },
    [disabled],
  );

  // These don't change while a line is dragged which keeps the effect below out of the pointermove loop
  const dragSide = dragState?.side;
  const dragId = dragState?.id;
  const dragPointerId = dragState?.pointerId;

  useEffect(() => {
    if (!dragSide || !dragId) return;

    const findDropTarget = (x: number, y: number) => {
      const circles = containerRef.current?.querySelectorAll<HTMLElement>(CIRCLE_SELECTOR);

      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      circles?.forEach((circle) => {
        const id = circle.dataset.ident;

        if (!id || circle.dataset.side === dragSide) return;

        // The circle sits on the edge of its element, so the whole element is used as the drop area
        const element = (circle.parentElement ?? circle).getBoundingClientRect();

        if (x >= element.left && x <= element.right && y >= element.top && y <= element.bottom) {
          closestId = id;
          closestDistance = 0;
          return;
        }

        const { left, top, width, height } = circle.getBoundingClientRect();
        const distance = Math.hypot(x - (left + width / 2), y - (top + height / 2));

        if (distance < closestDistance) {
          closestId = id;
          closestDistance = distance;
        }
      });

      return closestDistance <= SNAP_DISTANCE ? closestId : null;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerId) return;

      setDragState((prev) => {
        if (!prev) return prev;

        const moved =
          prev.moved ||
          Math.abs(e.clientX - prev.startX) > DRAG_THRESHOLD ||
          Math.abs(e.clientY - prev.startY) > DRAG_THRESHOLD;

        return {
          ...prev,
          clientX: e.clientX,
          clientY: e.clientY,
          moved,
          dropTargetId: moved ? findDropTarget(e.clientX, e.clientY) : null,
        };
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerId) return;

      const dropTargetId = findDropTarget(e.clientX, e.clientY);

      // Releasing on the circle the drag started on fires a click which selects the circle instead
      if (dropTargetId && dropTargetId !== dragId) {
        const [leftId, rightId] = dragSide === "left" ? [dragId, dropTargetId] : [dropTargetId, dragId];
        onConnectRef.current(leftId, rightId);
      }

      setDragState(null);
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== dragPointerId) return;
      setDragState(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDragState(null);
    };

    document.body.classList.add("ext-match-dragging");

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("ext-match-dragging");

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dragSide, dragId, dragPointerId]);

  // Everything below is only set after the pointer moved far enough to count as a drag
  const isDragging = dragState?.moved ?? false;

  return {
    containerRef,
    handleCirclePointerDown,
    dragLine:
      isDragging && dragState
        ? { circle: dragState.circle, clientX: dragState.clientX, clientY: dragState.clientY }
        : null,
    dragSourceId: isDragging ? (dragState?.id ?? null) : null,
    dropTargetId: isDragging ? (dragState?.dropTargetId ?? null) : null,
    highlightDragSide: isDragging ? (dragState?.side === "left" ? "right" : "left") : null,
  } as const;
}

/* ------------------------------------- DragLineOverlay ------------------------------------- */
interface IDragLineOverlay {
  container: React.RefObject<HTMLElement | null>;
  dragLine: TDragLine | null;
  color?: string;
}

/** Line that follows the pointer while dragging. It covers the whole container instead of living
 *  inside the svg between the two sides, so it doesn't get clipped and can't affect the layout.
 *  Render it as the first child of the container to keep the line behind the circles and elements. */
export const DragLineOverlay: React.FC<IDragLineOverlay> = ({
  container,
  dragLine,
  color = "var(--custom-prime-color)",
}) => {
  if (!dragLine || !container.current) return null;

  const containerPosition = container.current.getBoundingClientRect();
  const circlePosition = dragLine.circle.getBoundingClientRect();

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='drag-line-overlay'
      aria-hidden='true'
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <line
        x1={circlePosition.left + circlePosition.width / 2 - containerPosition.left}
        y1={circlePosition.top + circlePosition.height / 2 - containerPosition.top}
        x2={dragLine.clientX - containerPosition.left}
        y2={dragLine.clientY - containerPosition.top}
        stroke={color}
        strokeWidth='2'
        strokeDasharray='6 4'
        className='drag-line'
      />
    </svg>
  );
};
