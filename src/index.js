//Import React
import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch, BrowserRouter } from "react-router-dom";

//Import Css
import "./index.css";

//Import Components
import Home from "./Components/Main/Home/Home.js";
import Sidebar from "./Components/SharedComponents/Sidebar/Sidebar";
import Settings from "./Components/Main/Settings.js";
import Tutorials from "./Components/Main/Tutorials.js";
import Contribute from "./Components/Main/Contribute.js";
import Thanks from "./Components/Main/Thanks.js";
import News from "./Components/Main/News.js";
import Module from "./Components/Main/Module/Module.js";
import { Question } from "./Components/Main/Question/Question.js";
import AllQuestions from "./Components/Main/Module/AllQuestions/AllQuestions.js";
import Footer from "./Components/SharedComponents/Footer/Footer.jsx";
import LegalNotice from "./Components/Main/LegalNotice.jsx";
import Privacy from "./Components/Main/Privacy.jsx";

//Context
import { ModuleProvider } from "./Context/ModuleContext.js";

//Import functions
import ScrollToTop from "./functions/ScrollToTop";

//Web vitals
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Sidebar />
      <ScrollToTop>
        <main>
          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/tutorials' component={Tutorials} />
            <Route exact path='/contribute' component={Contribute} />
            <Route exact path='/thanks' component={Thanks} />
            <Route exact path='/news' component={News} />
            <Route exact path='/settings' component={Settings} />
            <Route exact path='/legal-notice' component={LegalNotice} />
            <Route exact path='/privacy' component={Privacy} />
            <ModuleProvider>
              <Route exact path='/module/:moduleID' component={Module} />
              <Route exact path='/module/:moduleID/question/:questionID' component={Question} />
              <Route exact path='/module/:moduleID/all-questions' component={AllQuestions} />
            </ModuleProvider>
          </Switch>
        </main>
        <Footer>Footer</Footer>
      </ScrollToTop>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
