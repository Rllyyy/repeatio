import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

//Import Icons
import { FaHome } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { RiSettings4Fill } from "react-icons/ri";
import { BiNews } from "react-icons/bi";
import { AiOutlineHeart } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";
import { FaHandshake } from "react-icons/fa";

const Sidebar = () => {
  //useState
  const [expandSidebar, setExpandSidebar] = useState(true); //TODO make this dependent on user settings
  //JSX
  return (
    <nav className={`${expandSidebar && "sidebar-expanded"}`}>
      <button className='hamburger' onClick={() => setExpandSidebar(!expandSidebar)}>
        <GiHamburgerMenu className='hamburger-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>repeatio</h2>
      </button>
      <Link to='/' className='home currentView'>
        <FaHome className='home-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>Home</h2>
      </Link>
      <Link to='/tutorials' className='tutorials'>
        <BsCameraVideo className='tutorials-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>Tutorials</h2>
      </Link>
      <Link to='/support' className='support highlighted'>
        <AiOutlineHeart className='support-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>Support this Project</h2>
      </Link>
      <Link to='/thanks' className='thanks'>
        <FaHandshake className='thanks-icon ' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>Special Thanks</h2>
      </Link>
      <Link to='/news' className='news'>
        <BiNews className='news-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>News</h2>
      </Link>
      <Link to='/settings' className='settings'>
        <RiSettings4Fill className='settings-icon' />
        <h2 className={`${expandSidebar && "sidebar-button-expanded"}`}>Settings</h2>
      </Link>
    </nav>
  );
};

export default Sidebar;
