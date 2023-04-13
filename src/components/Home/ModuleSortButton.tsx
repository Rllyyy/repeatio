import { MdSort } from "react-icons/md";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";

const moduleSortOptions = ["Name (ascending)", "Name (descending)", "ID (ascending)", "ID (descending)"] as const;

export type TModuleSortOption = typeof moduleSortOptions[number];

interface ISortButton {
  sort: TModuleSortOption;
  setSort: React.Dispatch<React.SetStateAction<TModuleSortOption>>;
}

/* Source: https://codesandbox.io/s/0e67co?file=/demo.tsx and https://mui.com/material-ui/react-menu/*/
export const SortButton: React.FC<ISortButton> = ({ sort, setSort }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, option: TModuleSortOption) => {
    setSort(option);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <List component='nav' aria-label='Sort Modules' sx={{ p: "0" }}>
        <button
          style={{
            lineHeight: "1",
            textAlign: "center",
            cursor: "pointer",
            padding: "6px 12px",
            height: "100%",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            columnGap: "4px",
            backgroundColor: "white",
            border: "1px solid var(--custom-border-color-lighter)",
            borderRadius: "5px",
            color: "inherit",
          }}
          aria-controls={open ? "sort-menu" : undefined}
          aria-haspopup='true'
          aria-expanded={open ? "true" : undefined}
          onClick={handleClickListItem}
          id='sort-modules-button'
        >
          <MdSort fontSize='24px' />
          <span style={{ fontWeight: "500" }}>Sort</span>
        </button>
      </List>
      <Menu
        id='sort-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          "&& .Mui-selected": {
            backgroundColor: "var(--custom-border-color-lighter)",
          },
          "&& .Mui-selected:hover": {
            backgroundColor: "var(--custom-border-color-lighter)",
          },
        }}
        MenuListProps={{
          "aria-labelledby": "sort-modules-button",
          role: "listbox",
        }}
      >
        {moduleSortOptions.map((option) => (
          <MenuItem key={option} selected={option === sort} onClick={(event) => handleMenuItemClick(event, option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
