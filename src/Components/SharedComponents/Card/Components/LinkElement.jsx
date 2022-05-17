import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

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

//Prop Types
LinkElement.propTypes = {
  linkTo: PropTypes.string.isRequired,
  linkAriaLabel: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
};

export default LinkElement;
