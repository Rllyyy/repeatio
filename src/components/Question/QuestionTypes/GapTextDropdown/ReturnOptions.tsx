import { Fragment } from "react";
import { IDropdownElement } from "./GapTextDropdown";

interface ReturnOptionsProps {
  dropdownItems: IDropdownElement["options"];
}

//Return the options for the corresponding select
export const ReturnOptions: React.FC<ReturnOptionsProps> = ({ dropdownItems }) => {
  //Return options plus empty option at the top
  return (
    <Fragment>
      <option value=''></option>
      {dropdownItems.map((optionText, index) => {
        return (
          <option key={index} value={optionText}>
            {optionText}
          </option>
        );
      })}
    </Fragment>
  );
};
