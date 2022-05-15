import React from "react";
import { Link } from "react-router-dom";

//Icons
import { IoIosArrowForward } from "react-icons/io";

//!URL might not work with special characters (äöß/#....)
//Component
const LinkElement = ({ linkTo, linkAriaLabel, linkText }) => {
  return (
    <Link className='card-link' to={linkTo} role='button' aria-label={linkAriaLabel}>
      <span>{linkText}</span>
      <IoIosArrowForward className='card-link-svg' />
    </Link>
  );
};

export default LinkElement;
