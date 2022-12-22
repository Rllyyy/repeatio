import { BrowserRouter, HashRouter } from "react-router-dom";
import isElectron from "is-electron";

// Electron require the use of the HashRouter but I want to use the BrowserRouter for the website
// else the url will always include "/#/"
export const Router = ({ children }: { children: React.ReactNode }) => {
  if (!isElectron()) {
    return <BrowserRouter>{children}</BrowserRouter>;
  } else {
    return <HashRouter>{children}</HashRouter>;
  }
};
