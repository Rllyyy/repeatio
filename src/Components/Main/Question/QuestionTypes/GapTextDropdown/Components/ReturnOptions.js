import { memo, Fragment } from "react";

//Return the options for the corresponding select
const ReturnOptions = ({ selectIndex, dropdowns }) => {
  //Return options plus empty option at the top
  return (
    <Fragment key={`select-${selectIndex}`}>
      <option value=''></option>
      {dropdowns.map((optionText, index) => {
        return (
          <option key={index} value={optionText}>
            {optionText}
          </option>
        );
      })}
    </Fragment>
  );
};

export default memo(ReturnOptions);
