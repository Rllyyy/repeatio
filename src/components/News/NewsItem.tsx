import { Link } from "react-router-dom";
import { normalizeLinkUri } from "../../utils/normalizeLinkUri";
import { z } from "zod";

import ReactMarkdown from "react-markdown";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import styles from "./news.module.css";
import markdownStyle from "./news-markdown-styles.module.css";

export const NewsItem: React.FC<{ item: TNewsItem }> = ({ item }) => {
  const cleanName = item.name.replace(/ /g, "").replace(/\./g, "_").toLowerCase();

  const formattedDate = getFormattedDate(item.published_at);

  return (
    <article className={styles.newsItem} id={cleanName}>
      <span className={styles.newsItem__date}>{formattedDate}</span>
      <div>
        <h2 className={styles.newsItem__heading}>
          <Link className={styles.newsItem__heading__link} to={{ hash: cleanName }}>
            {item.name}
          </Link>
        </h2>
        <ReactMarkdown
          className={markdownStyle.reactMarkDown}
          remarkPlugins={[remarkGfm, remarkGemoji]}
          rehypePlugins={[rehypeRaw]}
          linkTarget='_blank'
          transformLinkUri={normalizeLinkUri}
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
