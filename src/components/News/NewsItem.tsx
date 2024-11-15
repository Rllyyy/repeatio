import { Link } from "react-router-dom";
import { normalizeLinkUri } from "../../utils/normalizeLinkUri";
import { z } from "zod";

import ReactMarkdown from "react-markdown";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeExternalLinks from "rehype-external-links";

export const NewsItem: React.FC<{ item: TNewsItem }> = ({ item }) => {
  const cleanName = item.name.replace(/ /g, "").replace(/\./g, "_").toLowerCase();

  const formattedDate = getFormattedDate(item.published_at);

  return (
    <article
      className='prose border-t border-gray-300 grid lg:grid-cols-[200px_1fr] items-start max-w-[1100px] w-full lg:py-20 py-6 prose-h2:mt-0 lg:gap-20 gap-12 prose-h2:text-3xl'
      id={cleanName}
    >
      <span
        className='inline-block text-gray-600 lg:sticky lg:top-5 whitespace-nowrap w-52 shrink-0'
        style={{ fontSize: "16px" }}
      >
        {formattedDate}
      </span>
      <div>
        <h2>
          <Link className='no-underline text-inherit' to={{ hash: cleanName }}>
            {item.name}
          </Link>
        </h2>
        <ReactMarkdown
          className='max-w-full prose prose-ul:list-outside prose-h2:text-xl prose-a:no-underline prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-li:text-base prose-code:bg-gray-200 prose-code:rounded prose-code:p-0.5'
          remarkPlugins={[remarkGfm, remarkGemoji]}
          rehypePlugins={[rehypeRaw, [rehypeExternalLinks, { target: "_blank" }]]}
          urlTransform={normalizeLinkUri}
        >
          {item.body}
        </ReactMarkdown>
      </div>
    </article>
  );
};

function getFormattedDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export type TNewsItem = z.infer<typeof NewsItemsSchema>;

export const NewsItemsSchema = z.object({
  id: z.number(),
  name: z.string(),
  body: z.string(),
  created_at: z.string(),
  published_at: z.string(),
  tag_name: z.string(),
  target_commitish: z.string(),
  url: z.string(),
  assets_url: z.string(),
  upload_url: z.string(),
  html_url: z.string(),
  tarball_url: z.string(),
  zipball_url: z.string(),
  draft: z.boolean(),
  prerelease: z.boolean(),
});
