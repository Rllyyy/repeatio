import {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
  createContext,
  useContext,
  useLayoutEffect,
} from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ComponentPropsWithoutRef } from "react";
import DOMPurify from "dompurify";
import { forbiddenAttributes, forbiddenTags } from "../blockedTagsAttributes";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

// React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

// css
import "./GapText.css";

// Components
import { AnswerCorrection } from "./AnswerCorrection";

// Interfaces/Types
import { IForwardRefFunctions, IQuestionTypeComponent } from "../types";

// Define Interfaces
export interface IGapText {
  text: string;
  correctGapValues?: Array<Array<string>>;
}

interface IGapTextProps extends IQuestionTypeComponent {
  options: IGapText;
}

interface IGapTextContext {
  inputValues: string[];
  updateInput: (index: number, value: string) => void;
  onKeyDownPreventSubmit: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  formDisabled: boolean;
  correctGapValues?: Array<Array<string>>;
}

const GapTextContext = createContext<IGapTextContext | null>(null);

const useGapTextContext = () => {
  const context = useContext(GapTextContext);
  if (!context) {
    throw new Error("GapTextContext is missing. Make sure GapText wraps its content in the provider.");
  }
  return context;
};

type GapInputProps = ComponentPropsWithoutRef<"input"> & { node?: unknown; "data-index"?: string | number };

const GapInput = (props: GapInputProps) => {
  const { inputValues, updateInput, onKeyDownPreventSubmit, formDisabled, correctGapValues } = useGapTextContext();
  const rawIndex = props["data-index"] as string | number | undefined;
  const index = Number(rawIndex);
  const currentValue = inputValues[index] ?? "";
  const isCorrect = formDisabled && correctGapValues?.[index]?.includes(currentValue);
  const statusClass = formDisabled ? (isCorrect ? "gap--correct" : "gap--incorrect") : "";

  return (
    <input
      className={["gap", statusClass, props.className].filter(Boolean).join(" ")}
      id={`input-${index}`}
      type='text'
      autoCapitalize='off'
      autoComplete='off'
      spellCheck={false}
      value={currentValue}
      onChange={(event) => updateInput(index, event.target.value)}
      onKeyDown={onKeyDownPreventSubmit}
      disabled={formDisabled}
    />
  );
};

//Component
export const GapText = forwardRef<IForwardRefFunctions, IGapTextProps>(({ options, formDisabled }, ref) => {
  //States
  const [inputValues, setInputValues] = useState<string[]>([]);

  //Memo text so it hopefully doesn't get recalculated on every render
  const memoedText = useMemo(
    () =>
      DOMPurify.sanitize(options.text, {
        FORBID_TAGS: forbiddenTags,
        FORBID_ATTR: forbiddenAttributes,
      }),
    [options.text],
  );

  /* Functions */
  //Update the input where the input index is equal to the inputValues index
  const updateInput = useCallback((index: number, value: string) => {
    setInputValues((prevValues) => {
      const nextValues = [...prevValues];
      nextValues[index] = value;
      return nextValues;
    });
  }, []);

  //Prevent the form submission when entering "Enter" on an input element
  const onKeyDownPreventSubmit = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }, []);

  /* Effects */
  //Create array with x amount of empty input values and reset
  useLayoutEffect(() => {
    const gapCount = options?.correctGapValues?.length ?? 0;
    setInputValues(Array(gapCount).fill(""));

    return () => {
      setInputValues([]);
    };
  }, [options.correctGapValues]);

  //Imperative Handle so the parent can interact with this child
  useImperativeHandle(
    ref,
    (): IForwardRefFunctions => ({
      //Check if the answer is correct.
      checkAnswer() {
        //Strip the input values of any whitespace at the beginning or end and update the state (which will be updated after the function has completely finished)
        const trimmedInputValues = inputValues.map((value) => value.trim());

        setInputValues(trimmedInputValues);

        //Check if every gap correlates with the correct value from the gap array and return true/false to question form
        return (
          options.correctGapValues?.every((gapArray: string[], index: number) =>
            gapArray?.includes(trimmedInputValues[index]),
          ) ?? true
        );
      },

      //Return the correct answer in JSX so it can be displayed in the parent component
      returnAnswer() {
        return <AnswerCorrection text={options.text} correctGapValues={options?.correctGapValues} />;
      },

      //Reset User selection
      resetSelection() {
        //return empty string for every input value in the array
        setInputValues((prevValues) => Array(prevValues.length).fill(""));
      },

      //Trigger a useEffect (rerender) by increasing a state value
      resetAndShuffleOptions() {
        this.resetSelection();
      },
    }),
  );

  //JSX
  const markdownComponents = useMemo(() => {
    const Anchor = (props: ComponentPropsWithoutRef<"a"> & { node?: unknown }) => {
      const { target, children, ...rest } = props;
      return <a {...rest}>{children}</a>;
    };

    return {
      a: Anchor,
      gap: GapInput,
    };
  }, []);

  const markdownContent = useMemo(
    () => (
      <ReactMarkdown
        children={memoedText}
        urlTransform={normalizeLinkUri}
        rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
        remarkPlugins={[remarkMath, remarkGfm, remarkGapText]}
        disallowedElements={forbiddenTags}
        components={markdownComponents}
      />
    ),
    [memoedText, markdownComponents],
  );

  const contextValue = useMemo(
    () => ({
      inputValues,
      updateInput,
      onKeyDownPreventSubmit,
      formDisabled,
      correctGapValues: options.correctGapValues,
    }),
    [inputValues, updateInput, onKeyDownPreventSubmit, formDisabled, options.correctGapValues],
  );

  return (
    <div className='question-gap-text'>
      <GapTextContext.Provider value={contextValue}>{markdownContent}</GapTextContext.Provider>
    </div>
  );
});

/**
 * @summary Render the json string in markdown and return nodes with a marker where the input should be inserted
 */
function remarkGapText() {
  return (tree: any) => {
    let gapIndex = 0;
    const nextGapMarker = () => {
      const marker = `<gap data-index='${gapIndex}'></gap>`;
      gapIndex += 1;
      return marker;
    };

    const replaceHtmlGaps = (value: string) => {
      let result = "";
      let buffer = "";
      let inTag = false;

      for (let index = 0; index < value.length; index += 1) {
        const char = value[index];

        if (char === "<") {
          if (!inTag) {
            result += buffer.replace(/\[\]/g, nextGapMarker);
            buffer = "";
          }
          inTag = true;
          result += char;
          continue;
        }

        if (char === ">") {
          inTag = false;
          result += char;
          continue;
        }

        if (inTag) {
          result += char;
        } else {
          buffer += char;
        }
      }

      if (!inTag && buffer) {
        result += buffer.replace(/\[\]/g, nextGapMarker);
      }

      return result;
    };

    const visitNode = (node: any) => {
      if (!node || !node.children) return;

      const nextChildren: any[] = [];

      for (const child of node.children) {
        if (child?.type === "html" && typeof child.value === "string") {
          child.value = replaceHtmlGaps(child.value);
          nextChildren.push(child);
          continue;
        }

        if (child?.type === "text" && typeof child.value === "string") {
          const parts = child.value.split("[]");
          if (parts.length > 1) {
            for (let index = 0; index < parts.length; index += 1) {
              const part = parts[index];
              if (part) {
                nextChildren.push({ type: "text", value: part });
              }
              if (index < parts.length - 1) {
                nextChildren.push({ type: "html", value: nextGapMarker() });
              }
            }
            continue;
          }
        }

        if (child?.children && child.type !== "code" && child.type !== "inlineCode" && child.type !== "html") {
          visitNode(child);
        }

        nextChildren.push(child);
      }

      node.children = nextChildren;
    };

    visitNode(tree);
  };
}
