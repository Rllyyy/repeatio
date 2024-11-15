import DOMPurify from "dompurify";
import "katex/dist/katex.min.css";
import ReactDOMServer from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeExternalLinks from "rehype-external-links";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";
import { forbiddenTags, forbiddenAttributes } from "../blockedTagsAttributes";
import { IGapTextDropdown } from "./GapTextDropdown";

export const AnswerCorrection = ({ text, dropdowns }: IGapTextDropdown) => {
  return (
    <div
      className='correction-gap-text-with-dropdown'
      dangerouslySetInnerHTML={{ __html: textWithBlanks(text, dropdowns) }}
    />
  );
};

function textWithBlanks(text: string, dropdowns: IGapTextDropdown["dropdowns"]): string {
  //Render the json string in markdown and return html nodes
  //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
  //remarkGfm draws markdown tables
  const htmlString = ReactDOMServer.renderToString(
    <ReactMarkdown
      children={text}
      urlTransform={normalizeLinkUri}
      rehypePlugins={[rehypeRaw, rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]]}
      remarkPlugins={[remarkMath, remarkGfm]}
    />
  );

  //Split the html notes where the input should be inserted
  const htmlStringSplit = htmlString.split("[]");

  //Insert the input marker between the array elements but not at the end
  const htmlWithCorrection = htmlStringSplit
    .map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        return line.concat(`<span class='correct-dropdown-value'>${dropdowns?.[index].correct}</span>`);
      } else {
        return line;
      }
    })
    .join("");

  // Sanitize the result
  return DOMPurify.sanitize(htmlWithCorrection, {
    FORBID_TAGS: forbiddenTags,
    FORBID_ATTR: forbiddenAttributes,
  });
}
