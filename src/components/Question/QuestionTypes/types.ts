import { IQuestion } from "../useQuestion";

export interface IQuestionTypeComponent {
  formDisabled: boolean;
  name?: IQuestion["type"];
}

export interface IForwardRefFunctions {
  checkAnswer: () => boolean;
  returnAnswer: () => JSX.Element;
  resetSelection: () => void;
  resetAndShuffleOptions: () => void;
}
