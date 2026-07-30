import { forbiddenAttributes, forbiddenTags } from "../blockedTagsAttributes";
import { normalizeLinkUri } from "../../../../utils/normalizeLinkUri";
import { visit } from "unist-util-visit";
import type { Node } from "unist";

//React Markdown
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import "katex/dist/katex.min.css";

//Component
export const AnswerCorrection = ({
  text,
  correctGapValues,
}: {
  text: string;
  correctGapValues?: Array<Array<string>>;
}) => {
  //JSX
  return (
    <div className='correction-gap-text'>
      <ReactMarkdown
        children={text}
        urlTransform={normalizeLinkUri}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank" }],
          [rehypeGapCorrection, correctGapValues],
          rehypeBlockForbidden,
        ]}
        remarkPlugins={[remarkMath, remarkGfm]}
      />
    </div>
  );
};

// Concat the values with a semicolon, fallback to empty string if no value given
function concatValues(values?: Array<string>) {
  return values?.join("; ") || " ";
}

function rehypeGapCorrection(correctGapValues?: Array<Array<string>>) {
  return (tree: Node) => {
    let gapIndex = 0;
    visit(tree, "text", (node: any, index: number | null, parent: any) => {
      if (!parent || typeof index !== "number" || !node.value.includes("[]")) {
        return;
      }

      const parts = node.value.split("[]");
      const newNodes: any[] = [];

      parts.forEach((part: string, partIndex: number) => {
        if (part) {
          newNodes.push({ type: "text", value: part });
        }

        if (partIndex < parts.length - 1) {
          const concatenatedValues = concatValues(correctGapValues?.[gapIndex]);
          gapIndex += 1;
          newNodes.push({
            type: "element",
            tagName: "span",
            properties: { className: ["correct-gap-value"] },
            children: [{ type: "text", value: concatenatedValues }],
          });
        }
      });

      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
}

function rehypeBlockForbidden() {
  const forbiddenTagsSet = new Set(forbiddenTags);
  const forbiddenAttributesSet = new Set(forbiddenAttributes.map(normalizeAttributeName));

  return (tree: Node) => {
    visit(tree, "element", (node: any, index: number | null, parent: any) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      if (forbiddenTagsSet.has(node.tagName)) {
        parent.children.splice(index, 1);
        return index;
      }

      if (node.properties) {
        Object.keys(node.properties).forEach((key) => {
          if (forbiddenAttributesSet.has(normalizeAttributeName(key))) {
            delete node.properties[key];
          }
        });
      }
    });
  };
}

function normalizeAttributeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
