import { useState } from "react";
import "./Sidebar.css";

//Components
import { Categories } from "./Categories.js";

//Icon
import { FiMenu } from "react-icons/fi";

//Sidebar Component
export const Sidebar = () => {
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

//Hamburger Component
const Hamburger = ({ setExpandSidebar, expandSidebar }) => {
  return (
    <button className='hamburger' onClick={() => setExpandSidebar(!expandSidebar)}>
      <FiMenu className='hamburger-icon category-icon' />
      <p className={`${expandSidebar ? "sidebar-button-expanded" : ""}`}>repeatio</p>
    </button>
  );
};
