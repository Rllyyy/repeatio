import { Skeleton as MaterialSkeleton } from "@mui/material";
import styles from "./news.module.css";

export const LoadingNewsSkeleton = () => {
  return (
    <div className={styles.newsItems} aria-busy='true' aria-live='polite' aria-label='News are loading'>
      {[...Array(2).keys()].map((i) => (
        <article className={`prose ${styles.article}`} key={i}>
          <span className={styles.date}>
            <Skeleton.Date />
          </span>

          <div>
            <h2>
              <div className={styles.link}>
                <Skeleton.Heading />
              </div>
            </h2>

            <div className={`prose ${styles.markdown}`}>
              <Skeleton.Text />
              <Skeleton.Text marginBottom={"18px"} />

              <Skeleton.Text />
              <Skeleton.Text marginBottom={"18px"} />

              <Skeleton.Text />
              <Skeleton.Text />

              <Skeleton.ListHeading />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
              <Skeleton.ListItem />

              <Skeleton.ListHeading />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
              <Skeleton.ListItem />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

function Skeleton() {}

// Heading
function Heading() {
  return (
    <MaterialSkeleton sx={{ bgcolor: "grey.400", maxWidth: "260px" }} variant='rounded' width={"100%"} height={34} />
  );
}
Skeleton.Heading = Heading;

// Date
function Date() {
  return <MaterialSkeleton sx={{ bgcolor: "grey.300" }} variant='rounded' width={160} height={22} />;
}
Skeleton.Date = Date;

// Text
type TextProps = {
  marginBottom?: string | number;
};

function Text({ marginBottom }: TextProps) {
  return (
    <MaterialSkeleton
      sx={{ bgcolor: "grey.300", marginBottom: marginBottom ?? "8px" }}
      variant='rounded'
      width={"100%"}
      height={20}
    />
  );
}
Skeleton.Text = Text;

// ListHeading
function ListHeading() {
  return (
    <MaterialSkeleton
      sx={{ bgcolor: "grey.400", marginBottom: "16px", marginTop: "26px" }}
      variant='rounded'
      width={140}
      height={26}
    />
  );
}

Skeleton.ListHeading = ListHeading;

// ListItem
type ListItemProps = {
  marginBottom?: string | number;
};

function ListItem({ marginBottom }: ListItemProps) {
  return (
    <MaterialSkeleton
      sx={{ bgcolor: "grey.300", marginBottom: marginBottom ?? "8px", marginLeft: "20px" }}
      variant='rounded'
      width={"calc(100%-20px)"}
      height={18}
    />
  );
}
Skeleton.ListItem = ListItem;
