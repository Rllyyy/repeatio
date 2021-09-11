import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

//Import Icons
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHome } from "react-icons/fa";
import { BsCameraVideo } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { FaHandshake } from "react-icons/fa";
import { BiNews } from "react-icons/bi";
import { RiSettings4Fill } from "react-icons/ri";

//Navbar categories
//TODO if custom navbar comes, this has to be moved into the component as a state
const navbarCategories = [
  { className: "home", linkTo: "", icon: <FaHome />, text: "Home" },
  { className: "tutorials", linkTo: "tutorials", icon: <BsCameraVideo />, text: "Tutorials" },
  { className: "support", linkTo: "support", icon: <AiOutlineHeart />, text: "Support this Project" },
  { className: "thanks", linkTo: "thanks", icon: <FaHandshake />, text: "Special Thanks" },
  { className: "news", linkTo: "news", icon: <BiNews />, text: "News" },
  { className: "settings", linkTo: "settings", icon: <RiSettings4Fill />, text: "Settings" },
];

const Sidebar = () => {
  //useState
  const [expandSidebar, setExpandSidebar] = useState(true); //TODO make this dependent on user settings
  const [currentlyViewedCategory, setCurrentlyViewedCategory] = useState("");

  //Detect url changes to highlight background of current component in navbar
  //! This might break when using longer sub path (/../...)
  const location = useLocation();

  //Update the useState value every time the url changes
  useEffect(() => {
    const currentPath = location.pathname;

    //Remove dash that is in-front of the url
    let pathNoDash = currentPath.substring(1);

    setCurrentlyViewedCategory(pathNoDash);
  }, [location.pathname]);

  //Return true if the current url is equal to the currently viewed category
  const isCurrentCategoryView = useCallback(
    (category) => {
      if (currentlyViewedCategory === category) {
        return true;
      }
      return false;
    },
    [currentlyViewedCategory]
  );

  //JSX
  return (
    <nav className={`${expandSidebar && "sidebar-expanded"}`}>
      <button className='hamburger' onClick={() => setExpandSidebar(!expandSidebar)}>
        <GiHamburgerMenu className='hamburger-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>repeatio</h2>
      </button>
      {navbarCategories.map((category) => {
        //destructure category
        const { className, linkTo, icon, text } = category;
        return (
          <Link to={`/${linkTo}`} key={className} className={`${className} ${isCurrentCategoryView(linkTo) && "currentView"}`}>
            {icon}
            <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>{text}</h2>
          </Link>
        );
      })}
    </nav>
  );
};

export default Sidebar;
