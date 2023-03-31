import ReactDOMServer from "react-dom/server";
import DOMPurify from "dompurify";
import { forbiddenAttributes, forbiddenTags } from "../blockedTagsAttributes";

//React Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const concatValues = (values?: Array<string>) => {
  return values?.join("; ");
};

//Component
export const AnswerCorrection = ({
  text,
  correctGapValues,
}: {
  text: string;
  correctGapValues?: Array<Array<string>>;
}) => {
  const textWithBlanks = () => {
    //Render the json string in markdown and return html nodes
    //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
    //remarkGfm draws markdown tables
    const htmlString = ReactDOMServer.renderToString(
      <ReactMarkdown children={text} rehypePlugins={[rehypeRaw, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]} />
    );

    //Split the html notes where the input should be inserted
    const htmlStringSplit = htmlString.split("[]");

    //Insert the input marker between the array elements but not at the end
    const mappedArray = htmlStringSplit.map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        const concatenatedValues = concatValues(correctGapValues?.[index]);
        return ReactDOMServer.renderToString(
          <>
            <p>{line}</p>
            <p className='correct-gap-value'>{concatenatedValues}</p>
          </>
        );
      } else {
        return ReactDOMServer.renderToString(<p>{line}</p>);
      }
    });
    //Combine the array to one string again
    const joinedElements = mappedArray.join("");

    //Remove jsx specific html syntax
    const exportHTML = joinedElements
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll('data-reactroot=""', "");

    // Sanitize the result
    return DOMPurify.sanitize(exportHTML, {
      FORBID_TAGS: forbiddenTags,
      FORBID_ATTR: forbiddenAttributes,
    });
  };
  //JSX
  return <div className='correction-gap-text' dangerouslySetInnerHTML={{ __html: textWithBlanks() }} />;
};
