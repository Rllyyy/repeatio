import { useState, useEffect, useRef } from "react";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

//Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";

//Components
import { SVGElement } from "./ExtendedMatch";

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
}

//Component
export const AnswerCorrection = ({
  correctMatches,
  shuffledLeftOptions,
  shuffledRightOptions,
}: IExtendedMatchAnswerCorrectionProps) => {
  //useState
  const [correctLines, setCorrectLines] = useState<IExtendedMatchLineCorrection[]>([]);

  //useRef
  //Refs
  const left = useRef<Array<HTMLDivElement | null>>([]);
  const right = useRef<Array<HTMLDivElement | null>>([]);

  //Update the correct lines array
  useEffect(() => {
    const newCorrectMatches = correctMatches?.map((item) => {
      return {
        left: left.current[item.left as keyof IExtendedMatchLineCorrection["left"]],
        right: right.current[item.right as keyof IExtendedMatchLineCorrection["right"]],
      };
    });

    setCorrectLines([...(newCorrectMatches || [])]);

    return () => {
      setCorrectLines([]);
    };
  }, [correctMatches]);

  return (
    <div className='extended-match-grid-solution'>
      <div className={`ext-match-left-side`}>
        {shuffledLeftOptions?.map((item) => {
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
                ref={(el) => (left.current[id as keyof IExtendedMatchLineCorrection["left"]] = el)}
                data-ident={id}
              />
            </div>
          );
        })}
      </div>
      <SVGElement lines={correctLines} mode='static' />
      <div className={`ext-match-right-side`}>
        {shuffledRightOptions?.map((item) => {
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
                ref={(el) => (right.current[id as keyof IExtendedMatchLineCorrection["left"]] = el)}
                data-ident={id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
