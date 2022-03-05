import React from "react";
import ReactDOMServer from "react-dom/server";

//React Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const concatValues = (values) => {
  return values.join("; ");
};

//Component
const AnswerCorrection = ({ text, correctGapValues }) => {
  const textWithBlanks = () => {
    //Render the json string in markdown and return html nodes
    //rehype-raw allows the passing of html elements from the json file (when the users set a <p> text for example)
    //remarkGfm draws markdown tables
    const htmlString = ReactDOMServer.renderToString(
      <ReactMarkdown children={text} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} />
    );

    //Split the html notes where the input should be inserted
    const htmlStringSplit = htmlString.split("[]");

    //Insert the input marker between the array elements but not at the end
    const mappedArray = htmlStringSplit.map((line, index) => {
      if (index < htmlStringSplit.length - 1) {
        const concatenatedValues = concatValues(correctGapValues[index]);
        return ReactDOMServer.renderToString(
          <>
            <>{line}</>
            <input
              disabled
              key={`input-${index}`}
              type='text'
              autoCapitalize='off'
              autoComplete='off'
              spellCheck='false'
              value={concatenatedValues || ""}
              style={{ width: `${concatenatedValues.length}ch` }}
            />
          </>
        );
      } else {
        return ReactDOMServer.renderToString(<>{line}</>);
      }
    });
    //Combine the array to one string again
    const joinedElements = mappedArray.join("");

    //Remove jsx specific html syntax
    const exportHTMl = joinedElements
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll('data-reactroot=""', "");

    //Export to dangerouslySetInnerHTML
    //TODO: Sanitize the html with https://github.com/cure53/DOMPurify
    return exportHTMl;
  };
  //JSX
  return <div className='correction-gap-text' dangerouslySetInnerHTML={{ __html: textWithBlanks() }} />;
};

export default AnswerCorrection;
