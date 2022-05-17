import React from "react";
import PropTypes from "prop-types";

//Components
import LinkElement from "./LinkElement.jsx";
import ButtonElement from "./ButtonElement.jsx";

//Component
const LeftElement = ({ leftBottom }) => {
  //Return nothing if right element is not defined
  if (leftBottom === undefined) {
    return <></>;
  }

  //Return link or button element
  return (
    <>
      {leftBottom.type === "link" ? (
        <LinkElement
          linkTo={leftBottom.linkTo}
          linkAriaLabel={leftBottom.linkAriaLabel}
          linkText={leftBottom.linkText}
        />
      ) : (
        <ButtonElement handleClick={leftBottom.function} buttonText={leftBottom.buttonText} />
      )}
    </>
  );
};

//Prop Types
LeftElement.propTypes = {
  leftBottom: PropTypes.object,
};

export default LeftElement;
