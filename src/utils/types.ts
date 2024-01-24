export interface IParams {
  moduleID?: string;
  questionID?: string;
  [key: string]: string | undefined;
}

export interface ISearchParams {
  mode?: "practice" | "bookmarked"; // "selected" | "exam"
  order?: "chronological" | "random";
}
