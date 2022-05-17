import React from "react";
import PropTypes from "prop-types";

//Icons
import { IoIosArrowForward } from "react-icons/io";

//Component
const ButtonElement = ({ handleClick, buttonText }) => {
  return (
    <button className='card-button' onClick={handleClick}>
      <span>{buttonText}</span>
      <IoIosArrowForward className='card-button-svg' />
    </button>
  );
};

//Prop Types
ButtonElement.propTypes = {
  handleClick: PropTypes.func,
  buttonText: PropTypes.string.isRequired,
};

export default ButtonElement;
