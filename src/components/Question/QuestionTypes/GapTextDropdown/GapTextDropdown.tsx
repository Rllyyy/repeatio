import {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import type { ComponentPropsWithoutRef, ChangeEvent as ReactChangeEvent } from "react";
import DOMPurify from "dompurify";
import { forbiddenTags, forbiddenAttributes } from "../blockedTagsAttributes";

// React markdown related imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

// css
import "./GapTextDropdown.css";

// Components
import { AnswerCorrection } from "./AnswerCorrection";

// Functions
import { shuffleArray } from "../../../../utils/shuffleArray";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";

// Import Interfaces
import { IForwardRefFunctions, IQuestionTypeComponent } from "../types";

// Interfaces
export interface IDropdownElement {
  id: string;
  options: string[];
  correct: string;
}

export interface IGapTextDropdown {
  text: string;
  dropdowns?: IDropdownElement[];
}

interface GapTextDropdownComponentProps extends IQuestionTypeComponent {
  options: IGapTextDropdown;
}


interface IGapTextDropdownContext {
  selectedValues: string[];
  updateSelect: (index: number, value: string) => void;
  formDisabled: boolean;
  dropdowns?: IDropdownElement[];
  shuffledOptions: string[][];
}

const GapTextDropdownContext = createContext<IGapTextDropdownContext | null>(null);

const useGapTextDropdownContext = () => {
  const context = useContext(GapTextDropdownContext);
  if (!context) {
    throw new Error("GapTextDropdownContext is missing. Make sure GapTextDropdown wraps its content in the provider.");
  }
  return context;
};

type GapSelectProps = ComponentPropsWithoutRef<"select"> & { node?: unknown; "data-index"?: string | number };

const GapSelect = (props: GapSelectProps) => {
  const { selectedValues, updateSelect, formDisabled, dropdowns, shuffledOptions } = useGapTextDropdownContext();
  const { className, ...rest } = props;
  const rawIndex = props["data-index"] as string | number | undefined;
  const index = Number(rawIndex);
  const currentValue = selectedValues[index] ?? "";
  const correctValue = dropdowns?.[index]?.correct;
  const isCorrect = formDisabled && currentValue === correctValue;
  const borderColor = formDisabled ? (isCorrect ? "green" : "red") : undefined;
  const options = shuffledOptions[index] ?? dropdowns?.[index]?.options ?? [];

  const handleChange = (event: ReactChangeEvent<HTMLSelectElement>) => {
    updateSelect(index, event.target.value);
  };

  return (
    <select
      {...rest}
      className={["select", className].filter(Boolean).join(" ")}
      id={`select-${index}`}
      value={currentValue}
      onChange={handleChange}
      disabled={formDisabled}
      style={borderColor ? { borderColor } : undefined}
    >
      <option value=''></option>
      {options.map((text) => (
        <option key={text} value={text}>
          {text}
        </option>
      ))}
    </select>
  );
};

//Component
export const GapTextDropdown = forwardRef<IForwardRefFunctions, GapTextDropdownComponentProps>(
  ({ options, formDisabled }, ref) => {
    //States
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [shuffledDropdownOptions, setShuffledDropdownOptions] = useState<IDropdownElement["options"][]>([]);

    const memoedText = useMemo(
      () =>
        DOMPurify.sanitize(options.text, {
          FORBID_TAGS: forbiddenTags,
          FORBID_ATTR: forbiddenAttributes,
        }),
      [options.text]
    );

    const updateSelect = useCallback((index: number, value: string) => {
      setSelectedValues((prevValues) => {
        const nextValues = [...prevValues];
        nextValues[index] = value;
        return nextValues;
      });
    }, []);

    //Setup selected empty values
    useLayoutEffect(() => {
      const dropdownCount = options.dropdowns?.length ?? 0;
      setSelectedValues(Array(dropdownCount).fill(""));
      if (options.dropdowns) {
        setShuffledDropdownOptions(options.dropdowns.map((dropdown) => shuffleArray(dropdown.options)));
      }

      return () => {
        setSelectedValues([]);
        setShuffledDropdownOptions([]);
      };
    }, [options.dropdowns]);

    //Imperative handle allows the parent to interact with this child
    useImperativeHandle(ref, () => ({
      //Check if the answer is correct
      checkAnswer() {
        //Show if the answer is correct in the parent component by return true/false
        //Every value selected by the user must equal the corresponding value in the original data
        return selectedValues.every((selected, index) => {
          const correctValue = options.dropdowns?.[index]?.correct;
          return selected === correctValue;
        });
      },

      //Return the correct answer as jsx
      returnAnswer() {
        return <AnswerCorrection text={options.text} dropdowns={options.dropdowns} />;
      },

      //Reset the users selection
      //Triggered when the user clicks question-retry button before form submit
      resetSelection() {
        setSelectedValues((prevValues) => Array(prevValues.length).fill(""));
      },

      //Reset selection and reshuffle the dropdown options
      resetAndShuffleOptions() {
        this.resetSelection();
        if (options.dropdowns) {
          setShuffledDropdownOptions(options.dropdowns.map((dropdown) => shuffleArray(dropdown.options)));
        }
      },
    }));

    const markdownComponents = useMemo(() => {
      const Anchor = (props: ComponentPropsWithoutRef<"a"> & { node?: unknown }) => {
        const { target, children, ...rest } = props;
        return <a {...rest}>{children}</a>;
      };

      return {
        a: Anchor,
        gap: GapSelect,
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
      [memoedText, markdownComponents]
    );

    const contextValue = useMemo(
      () => ({
        selectedValues,
        updateSelect,
        formDisabled,
        dropdowns: options.dropdowns,
        shuffledOptions: shuffledDropdownOptions,
      }),
      [selectedValues, updateSelect, formDisabled, options.dropdowns, shuffledDropdownOptions]
    );

    //JSX
    return (
      <div className='question-gap-text-with-dropdown'>
        <GapTextDropdownContext.Provider value={contextValue}>{markdownContent}</GapTextDropdownContext.Provider>
      </div>
    );
  }
);

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
