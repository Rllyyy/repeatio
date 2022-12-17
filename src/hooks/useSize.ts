/* Get the size of a dom component. Used by the Question component to determine if the navigation should collapse and be only accessed by an arrow
 */
import { useState, useLayoutEffect } from "react";
import useResizeObserver from "@react-hook/resize-observer";

//https://www.npmjs.com/package/@react-hook/resize-observer
export function useSize<T extends React.MutableRefObject<HTMLElement | null>>(target: T) {
  const [size, setSize] = useState<DOMRectReadOnly | undefined>();

  useLayoutEffect(() => {
    setSize(target.current?.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
}
