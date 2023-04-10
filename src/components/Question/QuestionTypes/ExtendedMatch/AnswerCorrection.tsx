import { useState, useEffect, useRef, createRef, RefObject } from "react";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

//Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

//Components
import { Canvas } from "./Canvas";

// Interfaces
import { IExtendedMatch } from "./ExtendedMatch";

export interface IExtendedMatchLineCorrection {
  left?: HTMLDivElement | undefined | null;
  right?: HTMLDivElement | undefined | null;
}

interface IExtendedMatchAnswerCorrectionProps {
  correctMatches: IExtendedMatch["correctMatches"];
  shuffledLeftOptions: IExtendedMatch["leftSide"];
  shuffledRightOptions: IExtendedMatch["rightSide"];
  left: React.MutableRefObject<RefObject<HTMLButtonElement>[] | null | undefined>;
  right: React.MutableRefObject<RefObject<HTMLButtonElement>[] | null | undefined>;
}

//Component
export const AnswerCorrection = ({
  correctMatches,
  shuffledLeftOptions,
  shuffledRightOptions,
  left,
  right,
}: IExtendedMatchAnswerCorrectionProps) => {
  //useState
  const [correctLines, setCorrectLines] = useState<IExtendedMatchLineCorrection[]>([]);

  //useRef
  const leftCorrection = useRef<RefObject<HTMLDivElement>[] | null | undefined>(left?.current?.map(() => createRef()));
  const rightCorrection = useRef<RefObject<HTMLDivElement>[] | null | undefined>(
    right?.current?.map(() => createRef())
  );

  //Update the correct lines array
  useEffect(() => {
    const newCorrectMatches = correctMatches.map((item) => {
      //Find left item
      const resultLeft = leftCorrection.current?.find((obj) => obj.current?.getAttribute("data-ident") === item.left);

      const resultRight = rightCorrection.current?.find(
        (obj) => obj.current?.getAttribute("data-ident") === item.right
      );

      return { left: resultLeft?.current, right: resultRight?.current };
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
                linkTarget='_blank'
                transformLinkUri={normalizeLinkUri}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                remarkPlugins={[remarkGfm, remarkMath]}
              />
              <div
                className='ext-match-element-circle circle-disabled'
                ref={leftCorrection.current?.[index]}
                data-ident={id}
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
                linkTarget='_blank'
                transformLinkUri={normalizeLinkUri}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                remarkPlugins={[remarkMath]}
              />
              <div
                className='ext-match-element-circle circle-disabled'
                ref={rightCorrection.current?.[index]}
                data-ident={id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
