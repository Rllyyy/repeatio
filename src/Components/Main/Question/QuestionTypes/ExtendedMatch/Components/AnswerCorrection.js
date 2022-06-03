import React, { useState, useEffect, useRef, createRef } from "react";

//Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

//Components
import Canvas from "./Canvas";

//Component
const AnswerReturn = ({ correctMatches, shuffledLeftOptions, shuffledRightOptions, left, right }) => {
  //useState
  const [correctLines, setCorrectLines] = useState([]);

  //useRef
  const leftCorrection = useRef(left.current.map(() => createRef()));
  const rightCorrection = useRef(right.current.map(() => createRef()));

  //Update the correct lines array
  useEffect(() => {
    const newCorrectMatches = correctMatches.map((item) => {
      //Find left item
      const resultLeft = leftCorrection.current.find((obj) => obj.current?.attributes.ident.value === item.left);

      const resultRight = rightCorrection.current.find((obj) => obj.current?.attributes.ident.value === item.right);

      return { left: resultLeft.current, right: resultRight.current };
    });
    setCorrectLines([...newCorrectMatches]);

    return () => {
      setCorrectLines([]);
    };
  }, [correctMatches]);

  return (
    <div className='extended-match-grid-solution'>
      <div className={`ext-match-left-side`}>
        {shuffledLeftOptions.map((item, index) => {
          const { text, id } = item;
          return (
            <div className='ext-match-element' key={`ext-match-element-${id}`}>
              <ReactMarkdown
                className='ext-match-element-text'
                children={text}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                remarkPlugins={[remarkGfm, remarkMath]}
              />
              <div
                className='ext-match-element-circle circle-disabled'
                ref={leftCorrection.current[index]}
                ident={id}
              />
            </div>
          );
        })}
      </div>
      <Canvas lines={correctLines} />
      <div className={`ext-match-right-side`}>
        {shuffledRightOptions.map((item, index) => {
          const { text, id } = item;
          return (
            <div className='ext-match-element' key={`ext-match-element-${id}`}>
              <ReactMarkdown
                className='ext-match-element-text'
                children={text}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                remarkPlugins={[remarkMath]}
              />
              <div
                className='ext-match-element-circle circle-disabled'
                ref={rightCorrection.current[index]}
                ident={id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerReturn;
