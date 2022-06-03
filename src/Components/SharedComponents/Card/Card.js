import React from "react";
import PropTypes from "prop-types";
import "./Card.css";

//Components
import RightElement from "./Components/RightElement.jsx";
import LeftElement from "./Components/LeftElement.jsx";

//Component
const Card = ({ type, disabled, title, description, icon, leftBottom, rightBottom }) => {
  return (
    <article className={`card ${disabled ? "card-disabled " : "card-active"}`}>
      <div className='card-title-info-wrapper' style={type === "module" ? { paddingRight: "10px" } : {}}>
        <h2 className='card-title'>{title}</h2>
        <p className='card-description'>{description}</p>
      </div>
      <div className='svg-wrapper' style={type === "module-card" ? { padding: "12px", marginTop: "-12px" } : {}}>
        {icon}
      </div>
      <div className='card-bottom'>
        <LeftElement leftBottom={leftBottom} />
        <RightElement rightBottom={rightBottom} />
      </div>
    </article>
  );
};

//Prop Types
Card.propTypes = {
  type: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.object.isRequired,
  leftBottom: PropTypes.object,
  rightBottom: PropTypes.object,
};

export default Card;
