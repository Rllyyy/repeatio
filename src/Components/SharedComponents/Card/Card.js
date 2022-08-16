import PropTypes from "prop-types";
import { Link } from "react-router-dom";

//css
import "./Card.css";

//Icons
import { IoIosArrowForward } from "react-icons/io";

/* ----------------------------------------- CARD -------------------------------------------- */

//Card Component
const Card = ({ type, disabled, title, description, icon, children, ...props }) => {
  return (
    <article className={`card ${disabled ? "disabled " : "active"}`} {...props}>
      <div className='card-title-info-wrapper' style={type === "module" ? { paddingRight: "10px" } : {}}>
        <h2 className='card-title'>{title}</h2>
        <p className='card-description'>{description}</p>
      </div>
      <div className='svg-wrapper' style={type === "module-card" ? { padding: "12px", marginTop: "-12px" } : {}}>
        {icon}
      </div>
      <div className='card-bottom'>{children}</div>
    </article>
  );
};

//Card Prop Types
Card.propTypes = {
  type: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.object.isRequired,
};

/* ----------------------------------------- LINK -------------------------------------------- */

//!URL might not work with special characters (äöß/#....)
//Link Element Component
const LinkElement = ({ linkTo, linkAriaLabel, linkText }, props) => {
  return (
    <Link className='card-link' to={linkTo} role='button' aria-label={linkAriaLabel} {...props}>
      <span>{linkText}</span>
      <IoIosArrowForward className='card-link-svg' />
    </Link>
  );
};

//Link Prop Types
LinkElement.propTypes = {
  linkTo: PropTypes.string.isRequired,
  linkAriaLabel: PropTypes.string.isRequired,
  linkText: PropTypes.string.isRequired,
};

/* ----------------------------------- BUTTON (Start, View, etc.) ------------------------------- */

//Button Component
const ButtonElement = ({ handleClick, buttonText, ...props }) => {
  return (
    <button className='card-button' onClick={handleClick} {...props}>
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

export { Card, LinkElement, ButtonElement };
