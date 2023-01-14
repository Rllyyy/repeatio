import { useRef, useEffect } from "react";
import { useSize } from "../../../../hooks/useSize";
import { IExtendedMatchLineCorrection } from "./AnswerCorrection";
import { IExtendedMatchLine } from "./ExtendedMatch";

export const Canvas = ({ lines }: { lines: IExtendedMatchLine[] | IExtendedMatchLineCorrection[] }) => {
  //Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //Custom Hooks
  const canvasSize = useSize(canvasRef);

  //Redraw the whole canvas
  useEffect(() => {
    if (canvasSize === undefined || lines.length <= 0 || canvasSize.width === undefined) {
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, ctx?.canvas.width, ctx?.canvas.height);
      return;
    }

    //Create the canvas element
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current?.clientWidth;
      canvasRef.current.height = canvasRef.current.clientHeight;
    }

    let ctx = canvasRef.current?.getContext("2d");

    lines.forEach((line) => {
      //Guards: Only render the line if the left and right property are defined
      if (
        line.left === undefined ||
        line.right === undefined ||
        Object.keys(line).length !== 2 ||
        ctx === null ||
        ctx === undefined
      ) {
        return;
      }

      //Set the left and right side offset top to determine the Y values of the lines
      //The offset is the height of the circle (10 + 2 [???]) + the distance to the parent (ext-match-element) + the distance of the parent element to to the ext-match-left-side element
      //

      const leftOffsetTop = (line.left?.offsetTop || 0) + 12 + (line.left?.parentElement?.offsetTop || 0);
      const rightOffSetTop = (line.right?.offsetTop || 0) + 12 + (line.right?.parentElement?.offsetTop || 0);

      //Draw on the canvas
      ctx.beginPath();
      ctx.moveTo(0, leftOffsetTop);
      ctx.lineTo(canvasSize.width, rightOffSetTop);
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgb(150, 150, 150)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    return () => {
      try {
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      } catch (error) {}
    };
  }, [canvasSize]); // eslint-disable-line react-hooks/exhaustive-deps

  //Draw just the last line in the lines array
  useEffect(() => {
    if (lines.length < 1 || !canvasSize) {
      return;
    }

    const line = lines[lines.length - 1];

    //Guards: Only render the line if the left and right property are defined
    if (line.left === undefined || line.right === undefined || Object.keys(line).length !== 2) {
      return;
    }

    //Set the left and right side offset top to determine the Y values of the lines
    //The offset is the height of the circle (10 + 2 [???]) + the distance to the parent (ext-match-element) + the distance of the parent element to to the ext-match-left-side element

    const leftOffsetTop = (line.left?.offsetTop || 0) + 12 + (line.left?.parentElement?.offsetTop || 0);
    const rightOffSetTop = (line.right?.offsetTop || 0) + 12 + (line.right?.parentElement?.offsetTop || 0);

    //Draw on the canvas (but just the last line)
    const ctx = canvasRef.current?.getContext("2d");

    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(0, leftOffsetTop);
    ctx.lineTo(canvasSize?.width, rightOffSetTop);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgb(150, 150, 150)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  //Empty canvas
  return <canvas ref={canvasRef}></canvas>;
};
