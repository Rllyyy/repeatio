import React from "react";
import PropTypes from "prop-types";

//Components
import LinkElement from "./LinkElement.jsx";
import ButtonElement from "./ButtonElement.jsx";

//Component
const RightElement = ({ rightBottom }) => {
  //Return nothing if right element is not defined
  if (rightBottom === undefined) {
    return <></>;
  }

  //Return link or button element
  return (
    <>
      {rightBottom.type === "link" ? (
        <LinkElement
          linkTo={rightBottom.linkTo}
          linkAriaLabel={rightBottom.linkAriaLabel}
          linkText={rightBottom.linkText}
        />
      ) : (
        <ButtonElement handleClick={rightBottom.function} buttonText={rightBottom.buttonText} />
      )}
    </>
  );
};

//Prop Types
RightElement.propTypes = {
  rightBottom: PropTypes.object,
};

export default RightElement;
