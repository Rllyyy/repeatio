export interface IParams {
  moduleID?: string;
  questionID?: string;
}

export interface ISearchParams {
  mode?: "practice" | "bookmarked"; // "selected" | "exam"
  order?: "chronological" | "random";
}

export type TSettings = {
  addedExampleModule?: boolean;
};
