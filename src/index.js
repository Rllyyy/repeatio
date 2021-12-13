//Import React
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

//Import Css
import "./index.css";

//Import Components
import Home from "./Components/Main/Home.js";
import Sidebar from "./Components/Sidebar/Sidebar.js";
import Settings from "./Components/Main/Settings.js";
import Tutorials from "./Components/Main/Tutorials";
import Support from "./Components/Main/Support";
import Thanks from "./Components/Main/Thanks";
import News from "./Components/Main/News";
import Module from "./Components/Main/Module/Module.js";
import Question from "./Components/Main/Question/Question";

//Context
import { QuestionProvider } from "./Context/QuestionContext.js";

//Import functions
import ScrollToTop from "./functions/ScrollToTop";

//Web vitals
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Sidebar />
      <main>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/tutorials' component={Tutorials} />
          <Route exact path='/support' component={Support} />
          <Route exact path='/thanks' component={Thanks} />
          <Route exact path='/news' component={News} />
          <Route exact path='/settings' component={Settings} />
          <QuestionProvider>
            <Route exact path='/module/:moduleName' component={Module} />
            <Route exact path='/module/:moduleName/:questionID' component={Question} />
          </QuestionProvider>
        </Switch>
      </main>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
