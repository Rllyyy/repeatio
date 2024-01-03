import { Link, LinkProps } from "react-router-dom";
import { memo, PropsWithChildren, FC } from "react";
import { motion, MotionProps } from "framer-motion";

//css
import "./Card.css";

//Icons
import { IoIosArrowForward } from "react-icons/io";

/* ----------------------------------------- CARD -------------------------------------------- */
interface ICard extends MotionProps {
  type: "module-card" | "module";
  disabled?: boolean;
  title: string;
  description?: string;
  icon: JSX.Element;
}

//Card Component
export const Card: FC<PropsWithChildren<ICard>> = memo(
  ({ type, disabled, title, description, icon, children, ...props }) => {
    return (
      <motion.article className={`card ${disabled ? "disabled " : "active"}`} {...props}>
        <div className='card-title-info-wrapper' style={type === "module" ? { paddingRight: "10px" } : {}}>
          <h2 className='card-title font-bold'>{title}</h2>
          <p className='card-description'>{description}</p>
        </div>
        <div className='svg-wrapper' style={type === "module-card" ? { padding: "12px", marginTop: "-12px" } : {}}>
          {icon}
        </div>
        <div className='card-bottom'>{children}</div>
      </motion.article>
    );
  }
);

/* ----------------------------------------- LINK -------------------------------------------- */
//!This extend might be false
interface ILinkElement extends React.RefAttributes<HTMLAnchorElement> {
  linkTo: LinkProps["to"];
  state?: LinkProps["state"];
  linkAriaLabel: string;
  linkText: string;
}

//!URL might not work with special characters (äöß/#....)
//Link Element Component
export const LinkElement: React.FC<ILinkElement> = ({ linkTo, linkAriaLabel, linkText, state, ...props }) => {
  return (
    <Link className='card-link' to={linkTo} role='button' aria-label={linkAriaLabel} {...props} state={state}>
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
