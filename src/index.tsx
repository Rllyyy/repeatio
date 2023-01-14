//Import React
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Route, Switch } from "react-router-dom";
import { Router } from "./components/Router/Router";

//Import Css
import "./index.css";

//Import Pages
import Home from "./pages/index";

import { TutorialsPage } from "./pages/tutorials";
import { ContributePage } from "./pages/contribute";
import { ThanksPage } from "./pages/thanks";
import { NewsPage } from "./pages/news";
import { SettingsPage } from "./pages/settings";

import { LegalNoticePage } from "./pages/legal-notice";
import { PrivacyPage } from "./pages/privacy";

import { ModulePage } from "./pages/module/module";
import { QuestionPage } from "./pages/module/question/question";
import { AllQuestionsPage } from "./pages/module/all-questions/index";

//Import Components
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Footer } from "./components/Footer/Footer";
import { CustomToastContainer } from "./components/toast/toast";

//Context
import { ModuleProvider } from "./components/module/moduleContext";

//Import functions
import { ScrollToTop } from "./utils/ScrollToTop";

//Web vitals
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <StrictMode>
    <Router>
      <Sidebar />
      <ScrollToTop />
      <main>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/tutorials' component={TutorialsPage} />
          <Route exact path='/contribute' component={ContributePage} />
          <Route exact path='/thanks' component={ThanksPage} />
          <Route exact path='/news' component={NewsPage} />
          <Route exact path='/settings' component={SettingsPage} />
          <Route exact path='/legal-notice' component={LegalNoticePage} />
          <Route exact path='/privacy' component={PrivacyPage} />
          <ModuleProvider>
            <Route exact path='/module/:moduleID' component={ModulePage} />
            <Route exact path='/module/:moduleID/question/:questionID' component={QuestionPage} />
            <Route exact path='/module/:moduleID/all-questions' component={AllQuestionsPage} />
          </ModuleProvider>
        </Switch>
      </main>
      <Footer />
      <CustomToastContainer />
    </Router>
  </StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
