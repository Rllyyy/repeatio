import { UniqueIdentifier } from "@dnd-kit/core";
import { parseJSON } from "../../utils/parseJSON";
import { IParams } from "../../utils/types";
import { IModule } from "../module/module";
import { arrayMove } from "@dnd-kit/sortable";

export enum ActionTypes {
  FETCH = "FETCH",
  RESET = "RESET",
  MOVE_DOWN = "MOVE_DOWN",
  MOVE_UP = "MOVE_UP",
  MOVE = "MOVE",
}

interface IActionFetch {
  type: ActionTypes.FETCH;
  payload: {
    moduleId: IParams["moduleID"];
  };
}

interface IActionReset {
  type: ActionTypes.RESET;
}

interface IActionMove {
  type: ActionTypes.MOVE;
  payload: {
    activeId: UniqueIdentifier;
    overId: UniqueIdentifier;
  };
}

interface IActionMoveUp {
  type: ActionTypes.MOVE_UP;
  payload: {
    index: number;
  };
}
interface IActionMoveDown {
  type: ActionTypes.MOVE_DOWN;
  payload: {
    index: number;
  };
}

type IAction = IActionFetch | IActionReset | IActionMoveDown | IActionMoveUp | IActionMove;

interface IReducerState {
  questions: IModule["questions"];
  loading: boolean;
  error: boolean;
}

export const defaultState = {
  questions: [],
  loading: true,
  error: false,
};

export function reducer(state: IReducerState = defaultState, action: IAction) {
  switch (action.type) {
    // Get the questions from the localStorage
    case ActionTypes.FETCH:
      const questions = parseJSON<IModule>(localStorage.getItem(`repeatio-module-${action.payload.moduleId}`))
        ?.questions;

      if (questions) {
        return {
          questions: questions,
          loading: false,
          error: false,
        };
      } else {
        return {
          ...state,
          loading: false,
          error: true,
        };
      }

    // Reset to the default state (used by the useEffect unmounting)
    case ActionTypes.RESET:
      return defaultState;

    case ActionTypes.MOVE:
      const { activeId, overId } = action.payload;

      let reorderedQuestions = [...state.questions];

      const oldIndex = state.questions.findIndex((question) => question.id === activeId);
      const newIndex = state.questions.findIndex((question) => question.id === overId);

      return {
        ...state,
        questions: arrayMove(reorderedQuestions, oldIndex, newIndex),
      };

    // Move a question up
    case ActionTypes.MOVE_UP:
      let movedUpQuestions = [...state.questions];
      const upIndex = action.payload.index;

      if (upIndex >= 1) {
        // Swap the question with the
        [movedUpQuestions[upIndex], movedUpQuestions[upIndex - 1]] = [
          movedUpQuestions[upIndex - 1],
          movedUpQuestions[upIndex],
        ];
      } else {
        // Move Question to end of array
        movedUpQuestions.push(movedUpQuestions.splice(upIndex, 1)[0]);
      }

      return {
        ...state,
        questions: movedUpQuestions,
      };

    //Move a question down
    case ActionTypes.MOVE_DOWN:
      let movedDownQuestions = [...state.questions];
      const downIndex = action.payload.index;

      if (downIndex + 1 >= state.questions.length) {
        // Move question to the start of the array
        movedDownQuestions.unshift(movedDownQuestions.splice(downIndex, 1)[0]);
      } else {
        // Swap the question with the question below it
        [movedDownQuestions[downIndex], movedDownQuestions[downIndex + 1]] = [
          movedDownQuestions[downIndex + 1],
          movedDownQuestions[downIndex],
        ];
      }

      return {
        ...state,
        questions: movedDownQuestions,
      };
    default:
      throw Error("Unknown action");
  }
}
