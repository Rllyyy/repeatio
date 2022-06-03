import React, { useState } from "react";
import "./Sidebar.css";

//Components
import Hamburger from "./Components/Hamburger.js";
import Categories from "./Components/Categories.js";

//Component
const Sidebar = () => {
  //useState
  const [expandSidebar, setExpandSidebar] = useState(false); //TODO make this dependent on user settings

  //JSX
  return (
    <nav className={`sidebar ${expandSidebar && "sidebar-expanded"}`}>
      <Hamburger setExpandSidebar={setExpandSidebar} expandSidebar={expandSidebar} />
      <Categories setExpandSidebar={setExpandSidebar} expandSidebar={expandSidebar} />
    </nav>
  );
};

export default Sidebar;
