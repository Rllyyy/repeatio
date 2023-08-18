//Import React
import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes } from "react-router-dom";
import { Router } from "./components/Router/Router";

//Import Css
import "./index.css";

//Import Pages

import Home from "./pages/index";
import ModulePage from "./pages/module";
import { QuestionPage } from "./pages/module/question/question";

//Import Components
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Footer } from "./components/Footer/Footer";
import { CustomToastContainer } from "./components/toast/toast";
import { SuspenseWithErrorBoundary } from "./components/SuspenseWithErrorBoundary";

//Context
import { QuestionIdsProvider } from "./components/module/questionIdsContext";

//Import functions
import { ScrollToTop } from "./utils/ScrollToTop";

// Lazy load pages
const TutorialsPage = React.lazy(() => import("./pages/tutorials"));
const SettingsPage = React.lazy(() => import("./pages/settings"));
const ContributePage = React.lazy(() => import("./pages/contribute"));
const ThanksPage = React.lazy(() => import("./pages/thanks"));
const NewsPage = React.lazy(() => import("./pages/news"));

const LegalNoticePage = React.lazy(() => import("./pages/legal-notice"));
const PrivacyPage = React.lazy(() => import("./pages/privacy"));
const AllQuestionsPage = React.lazy(() => import("./pages/module/all-questions"));

// Define root element
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <StrictMode>
    <Router>
      <Sidebar />
      <ScrollToTop />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          {/* Tutorials */}
          <Route
            path='/tutorials'
            element={
              <SuspenseWithErrorBoundary>
                <TutorialsPage />
              </SuspenseWithErrorBoundary>
            }
          />
          {/* Contribute */}
          <Route
            path='/contribute'
            element={
              <SuspenseWithErrorBoundary>
                <ContributePage />
              </SuspenseWithErrorBoundary>
            }
          />
          <Route
            path='/thanks'
            element={
              <SuspenseWithErrorBoundary>
                <ThanksPage />
              </SuspenseWithErrorBoundary>
            }
          />

          <Route
            path='/news'
            element={
              <SuspenseWithErrorBoundary>
                <NewsPage />
              </SuspenseWithErrorBoundary>
            }
          />
          <Route
            path='/settings'
            element={
              <SuspenseWithErrorBoundary>
                <SettingsPage />
              </SuspenseWithErrorBoundary>
            }
          />
          <Route
            path='/legal-notice'
            element={
              <SuspenseWithErrorBoundary>
                <LegalNoticePage />
              </SuspenseWithErrorBoundary>
            }
          />
          <Route
            path='/privacy'
            element={
              <SuspenseWithErrorBoundary>
                <PrivacyPage />
              </SuspenseWithErrorBoundary>
            }
          />
          <Route path='/module/:moduleID' element={<ModulePage />} />
          <Route
            path='/module/:moduleID/all-questions'
            element={
              <SuspenseWithErrorBoundary>
                <AllQuestionsPage />
              </SuspenseWithErrorBoundary>
            }
          />
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
