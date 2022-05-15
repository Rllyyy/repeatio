import React from "react";

import LinkElement from "./LinkElement.jsx";
import ButtonElement from "./ButtonElement.jsx";

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

export default LeftElement;
