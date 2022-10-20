/*  
  This file contains all Elements (PopoverButton, PopoverMenu, PopoverMenuItem ) that are related to a Popover (3 dots vertical that show menu onclick).
*/

/* ----------------------------------- Imports -------------------------------------------- */
import PropTypes from "prop-types";

//MaterialUI
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

//Icons
import { HiDotsVertical } from "react-icons/hi";

/* ------------------------------- Popover Button (vertical Dots) ------------------------------- */
//Component
const PopoverButton = ({ handleClick, target }) => {
  return (
    <button className='popover-button' onClick={handleClick} data-target={target}>
      <HiDotsVertical />
    </button>
  );
};

//PopoverButton Prop Types
PopoverButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  target: PropTypes.string,
};

/* ------------------------------- Popover Menu ------------------------------- */
//Style Material UI Menu
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    transitionDuration={0}
    transformOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 5,
    color: "inherit",
    marginTop: -5,
    boxShadow:
      "0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2), rgba(0,0,10, 0.1) 0px 0px 0px 1px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      color: "inherit",
      cursor: "pointer",
      "@media screen and (min-width: 600px)": {
        minHeight: "auto !important",
      },
      "&:hover": {
        "@media screen and (pointer: fine) and (hover: hover)": {
          backgroundColor: "rgb(240, 240, 245)",
        },
      },
      "& svg": {
        fontSize: 24,
        lineHeight: 0,
        marginRight: theme.spacing(1.5),
        "@media screen and (max-width: 650px)": {
          fontSize: 26,
        },
      },
      "& span": {
        fontSize: 16,
        "@media screen and (max-width: 650px)": {
          fontSize: 18,
        },
      },
    },
  },
}));

//PopoverMenu that is returned
const PopoverMenu = ({ anchorEl, handlePopoverClose, children }) => {
  return (
    <StyledMenu
      MenuListProps={{
        "aria-labelledby": "Module-actions",
      }}
      anchorEl={anchorEl}
      open={!!anchorEl}
      onClose={handlePopoverClose}
    >
      {children}
    </StyledMenu>
  );
};

PopoverMenu.propTypes = {
  anchorEl: PropTypes.object,
  handlePopoverClose: PropTypes.func.isRequired,
};

/* -------------------------------------- POPOVER MENU ITEM ------------------------------------- */
//Component
const PopoverMenuItem = ({ handleClick, text, icon, disabled }) => {
  return (
    <MenuItem onClick={handleClick} disableRipple disabled={disabled}>
      {icon}
      <span>{text}</span>
    </MenuItem>
  );
};

//PopoverMenuItems Prop Types
PopoverMenuItem.propTypes = {
  handleClick: PropTypes.func,
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
};

/* ------------------------------------------------------------------------- */

export { PopoverButton, PopoverMenu, PopoverMenuItem };
