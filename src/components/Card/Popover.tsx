/*  
  This file contains all Elements (PopoverButton, PopoverMenu, PopoverMenuItem ) that are related to a Popover (3 dots vertical that show menu onclick).
*/

/* ----------------------------------- Imports -------------------------------------------- */
//MaterialUI
import { styled } from "@mui/material/styles";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

//Icons
import { HiDotsVertical } from "react-icons/hi";

/* ------------------------------- Popover Button (vertical Dots) ------------------------------- */
//Interface
interface IPopoverButton {
  handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  target?: string;
}
//Component
export const PopoverButton = ({ handleClick, target }: IPopoverButton) => {
  return (
    <button
      className='popover-button'
      onClick={handleClick}
      data-target={target}
      title='Options'
      aria-label='Open Popover'
      type='button'
    >
      <HiDotsVertical />
    </button>
  );
};

/* ------------------------------- Popover Menu ------------------------------- */
//Style Material UI Menu (https://mui.com/material-ui/react-menu/#customization)
const StyledMenu = styled((props: MenuProps) => (
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

interface IPopoverMenu {
  anchorEl: HTMLButtonElement | null;
  handlePopoverClose: () => void;
  children: React.ReactNode;
}

//PopoverMenu that is returned
export const PopoverMenu = ({ anchorEl, handlePopoverClose, children }: IPopoverMenu) => {
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

/* -------------------------------------- POPOVER MENU ITEM ------------------------------------- */
interface IPopoverMenuItem {
  handleClick: () => void | Promise<void>;
  text: string;
  icon: JSX.Element;
  disabled?: boolean;
}

const IconWithText = ({ icon, text }: { icon: JSX.Element; text: string }) => {
  return (
    <>
      {icon}
      <span>{text}</span>
    </>
  );
};

//Component
export const PopoverMenuItem = ({ handleClick, text, icon, disabled }: IPopoverMenuItem) => {
  return (
    <MenuItem onClick={handleClick} disableRipple disabled={disabled}>
      <IconWithText icon={icon} text={text} />
    </MenuItem>
  );
};
