import { Link } from "react-router-dom";
import { memo } from "react";

//css
import "./Card.css";

//Icons
import { IoIosArrowForward } from "react-icons/io";

/* ----------------------------------------- CARD -------------------------------------------- */
interface ICard extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  type: "module-card" | "module";
  disabled?: boolean;
  title: string;
  description?: string;
  icon: JSX.Element;
}

//Card Component
export const Card = memo(({ type, disabled, title, description, icon, children, ...props }: ICard) => {
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
});

/* ----------------------------------------- LINK -------------------------------------------- */
//!This extend might be false
interface ILinkElement extends React.RefAttributes<HTMLAnchorElement> {
  linkTo: string;
  linkAriaLabel: string;
  linkText: string;
}

//!URL might not work with special characters (äöß/#....)
//Link Element Component
export const LinkElement = ({ linkTo, linkAriaLabel, linkText, ...props }: ILinkElement) => {
  return (
    <Link className='card-link' to={linkTo} role='button' aria-label={linkAriaLabel} {...props}>
      <span>{linkText}</span>
      <IoIosArrowForward className='card-link-svg' />
    </Link>
  );
};

/* ----------------------------------- BUTTON (Start, View, etc.) ------------------------------- */
interface IButtonElement
  extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  buttonText: string;
  handleClick?: () => void;
}

//Button Component
export const ButtonElement = ({ handleClick, buttonText, ...props }: IButtonElement) => {
  return (
    <button className='card-button' onClick={handleClick} {...props}>
      <span>{buttonText}</span>
      <IoIosArrowForward className='card-button-svg' />
    </button>
  );
};
