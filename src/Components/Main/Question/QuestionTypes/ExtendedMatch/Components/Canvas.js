import React, { useRef, useEffect } from "react";
import { useSize } from "../../../../../../hooks/useSize";

const Canvas = ({ lines }) => {
  //Refs
  const canvasRef = useRef();

  //Custom Hooks
  const canvasSize = useSize(canvasRef);

  //Redraw the whole canvas
  useEffect(() => {
    if (canvasSize === undefined || lines.length <= 0 || canvasSize.width === undefined) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.width, ctx.height);
      return;
    }

    //Create the canvas element
    //const canvasEle = canvasRef.current;
    canvasRef.current.width = canvasRef.current.clientWidth;
    canvasRef.current.height = canvasRef.current.clientHeight;
    let ctx = canvasRef.current.getContext("2d");

    lines.forEach((line) => {
      //Guards: Only render the line if the left and right property are defined
      if (line.left === undefined || line.right === undefined || Object.keys(line).length !== 2) {
        return;
      }

      //Set the left and right side offset top to determine the Y values of the lines
      //The offset is the height of the circle (10 + 2 [???]) + the distance to the parent (ext-match-element) + the distance of the parent element to to the ext-match-left-side element
      //
      const leftOffsetTop = line.left.offsetTop + 12 + line.left.parentNode.offsetTop;
      const rightOffSetTop = line.right.offsetTop + 12 + line.right.parentNode.offsetTop;

      //Draw on the canvas
      ctx.beginPath();
      ctx.moveTo(0, leftOffsetTop);
      ctx.lineTo(canvasSize.width, rightOffSetTop);
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgb(150, 150, 150)";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    return () => {
      try {
        ctx.clearRect(0, 0, ctx.width, ctx.height);
      } catch (error) {}
    };
  }, [canvasSize]); // eslint-disable-line react-hooks/exhaustive-deps

  //Draw just the last line in the lines array
  useEffect(() => {
    if (lines.length < 1) {
      return;
    }

    const line = lines[lines.length - 1];

    //Guards: Only render the line if the left and right property are defined
    if (line.left === undefined || line.right === undefined || Object.keys(line).length !== 2) {
      return;
    }

    //Set the left and right side offset top to determine the Y values of the lines
    //The offset is the height of the circle (10 + 2 [???]) + the distance to the parent (ext-match-element) + the distance of the parent element to to the ext-match-left-side element

    const leftOffsetTop = line.left.offsetTop + 12 + line.left.parentNode.offsetTop;
    const rightOffSetTop = line.right.offsetTop + 12 + line.right.parentNode.offsetTop;

    //Draw on the canvas (but just the last line)
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(0, leftOffsetTop);
    ctx.lineTo(canvasSize.width, rightOffSetTop);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgb(150, 150, 150)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  //Empty canvas
  return <canvas ref={canvasRef}></canvas>;
};

export default Canvas;
