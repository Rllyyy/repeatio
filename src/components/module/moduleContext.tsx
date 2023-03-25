import React, { createContext, useMemo, useState } from "react";

// Interfaces
import { IQuestion } from "../Question/useQuestion";

export interface IModuleContext {
  data: TData;
  setData: React.Dispatch<React.SetStateAction<TData>>;
}

type TData = {
  mode?: "practice" | "bookmarked"; // | "selected" | "exam"
  order?: "chronological" | "random";
  questionIds?: IQuestion["id"][];
};

//Create Question Context
export const ModuleContext = createContext({} as IModuleContext);

//Provide the data to all children
export const ModuleProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<TData>({} as TData);

  // Memorize the data
  const dataProvider = useMemo(() => ({ data, setData }), [data, setData]);

  return (
    <ModuleContext.Provider
      value={{
        data: dataProvider.data,
        setData: dataProvider.setData,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};
