//Import React
import React, { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes } from "react-router-dom";
import { Router } from "./components/Router/Router";

//Import Css
import "./index.css";

//Import Pages
import Home from "./pages/index";

import { TutorialsPage } from "./pages/tutorials";
import { ContributePage } from "./pages/contribute";
import { ThanksPage } from "./pages/thanks";
import { NewsPage } from "./pages/news";

import { LegalNoticePage } from "./pages/legal-notice";
import { PrivacyPage } from "./pages/privacy";

import { ModulePage } from "./pages/module/module";
import { QuestionPage } from "./pages/module/question/question";
import { AllQuestionsPage } from "./pages/module/all-questions/index";

//Import Components
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Footer } from "./components/Footer/Footer";
import { CustomToastContainer } from "./components/toast/toast";
import { ErrorBoundary } from "react-error-boundary";

//Context
import { QuestionIdsProvider } from "./components/module/questionIdsContext";

//Import functions
import { ScrollToTop } from "./utils/ScrollToTop";
import { CircularTailSpinner } from "./components/Spinner";

// Lazy load settings page
const SettingsPage = React.lazy(() => import("./pages/settings"));

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Router>
      <Sidebar />
      <ScrollToTop />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tutorials' element={<TutorialsPage />} />
          <Route path='/contribute' element={<ContributePage />} />
          <Route path='/thanks' element={<ThanksPage />} />
          <Route path='/news' element={<NewsPage />} />
          <Route
            path='/settings'
            element={
              <ErrorBoundary fallback={<p>Failed to load.</p>}>
                <Suspense fallback={<CircularTailSpinner />}>
                  <SettingsPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route path='/legal-notice' element={<LegalNoticePage />} />
          <Route path='/privacy' element={<PrivacyPage />} />
          <Route path='/module/:moduleID' element={<ModulePage />} />
          <Route path='/module/:moduleID/all-questions' element={<AllQuestionsPage />} />
          <Route
            path='/module/:moduleID/question/:questionID'
            element={
              <QuestionIdsProvider>
                <QuestionPage />
              </QuestionIdsProvider>
            }
          />
        </Routes>
      </main>
      <Footer />
      <CustomToastContainer />
    </Router>
  </StrictMode>
);
