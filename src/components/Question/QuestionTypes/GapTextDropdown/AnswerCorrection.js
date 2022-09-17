import ReactDOMServer from "react-dom/server";

//React Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export const AnswerCorrection = ({ text, dropdowns }) => {
  const markdownText = () => {
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
      if (index < htmlStringSplit.length - 1 && index !== undefined) {
        return ReactDOMServer.renderToString(
          <>
            <p>{line}</p>
            <p className='correct-dropdown-value'>{dropdowns[index].correct}</p>
          </>
        );
      } else {
        return ReactDOMServer.renderToString(<p>{line}</p>);
      }
    });
    //Combine the array to one string again
    const joinedElements = mappedArray.join("");

    //Remove jsx specific html syntax
    const exportHTMl = joinedElements
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll('data-reactroot=""', "");

    //Export to dangerouslySetInnerHTML
    //TODO: Sanitize the html with https://github.com/cure53/DOMPurify
    return exportHTMl;
  };
  return <div className='correction-gap-text-with-dropdown' dangerouslySetInnerHTML={{ __html: markdownText() }} />;
};