import React from "react";

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

export default ButtonElement;
