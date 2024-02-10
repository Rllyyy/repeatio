import { NewsItem, type TNewsItem, NewsItemsSchema } from "./NewsItem";
import { useQuery } from "@tanstack/react-query";

import styles from "./news.module.css";

async function fetchData(): Promise<TNewsItem[] | undefined> {
  try {
    // Fetch data from GitHub API. Might switch to octokit in the future
    const response = await fetch("https://api.github.com/repos/Rllyyy/repeatio/releases");

    if (!response.ok) {
      throw new Error(`Error fetching news (${response.status})`);
    }

    const value = await response.json();

    const safeValue = NewsItemsSchema.array().parse(value);
    return safeValue;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ZodError") {
        throw new Error("Schema validation failed");
      }
      throw new Error(error.message ?? "Failed to fetch news");
    }
  }
}

const NewsItems = () => {
  const { data, isError, error, isSuccess } = useQuery({ queryKey: ["news"], queryFn: fetchData });

  if (isError) {
    throw new Error(error.message ?? "Failed to fetch news");
  }

  if (data?.length === 0 && isSuccess) {
    return (
      <div className={styles.headingWrapper}>
        <p>
          <b>No news available</b>
        </p>
      </div>
    );
  }

  return <div className={styles.newsItems}>{data?.map((item) => <NewsItem key={item.id} item={item} />)}</div>;
};

export default NewsItems;
