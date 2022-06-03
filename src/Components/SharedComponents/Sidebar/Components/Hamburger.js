import React from "react";

//Icon
import { FiMenu } from "react-icons/fi";

const Hamburger = ({ setExpandSidebar, expandSidebar }) => {
  return (
    <button className='hamburger' onClick={() => setExpandSidebar(!expandSidebar)}>
      <FiMenu className='hamburger-icon category-icon' />
      <p className={`${expandSidebar ? "sidebar-button-expanded" : ""}`}>repeatio</p>
    </button>
  );
};

export default Hamburger;
