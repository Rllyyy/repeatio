import React, { createContext, useMemo, useState } from "react";

// Interfaces
import { IQuestion } from "../Question/useQuestion";

export interface IQuestionIdsContext {
  questionIds: IQuestion["id"][];
  setQuestionIds: React.Dispatch<React.SetStateAction<IQuestion["id"][]>>;
}

//Create Context
export const QuestionIdsContext = createContext({} as IQuestionIdsContext);

//Provide the data to all children
export const QuestionIdsProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<IQuestionIdsContext["questionIds"]>([]);

  // Memorize the data
  const dataProvider = useMemo(() => ({ data, setData }), [data, setData]);

  return (
    <QuestionIdsContext.Provider
      value={{
        questionIds: dataProvider.data,
        setQuestionIds: dataProvider.setData,
      }}
    >
      {children}
    </QuestionIdsContext.Provider>
  );
};
