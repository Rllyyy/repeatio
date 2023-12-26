import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DefaultFallbackComponent } from "../components/SuspenseWithErrorBoundary";
import { LoadingNewsSkeleton } from "../components/News/Loading";

// CSS
import styles from "../components/News/news.module.css";

const NewsComponent = lazy(() => import("../components/News/NewsItems"));

export default function NewsPage() {
  return (
    <>
      <ErrorBoundary FallbackComponent={DefaultFallbackComponent}>
        <div className={styles.headingWrapper}>
          <h1>News</h1>
          <p className={styles.headingWrapper__subheading}>The latests updates and improvements to repeatio</p>
        </div>
        <Suspense fallback={<LoadingNewsSkeleton />}>
          <NewsComponent />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
