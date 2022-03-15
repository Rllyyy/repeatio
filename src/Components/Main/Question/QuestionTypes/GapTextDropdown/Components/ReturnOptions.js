import React from "react";

//Functions
import shuffleArray from "../../../../../../functions/shuffleArray.js";

//Component
//Return the options for the corresponding select
//The component rerenders if one of the props change (shuffleTrigger), otherwise it doesn't
const ReturnOptions = ({ selectIndex, options, shuffleTrigger }) => {
  //Find the correct dropdown
  const dropdownOptions = options.dropdowns.find((item) => item.id === `select-${selectIndex}`);

  //randomize dropdown list
  const shuffledDropdownOptions = shuffleArray(dropdownOptions.options);

  //Return options plus empty option at the top
  return (
    <React.Fragment key={`select-${selectIndex}`}>
      <option value=''></option>
      {shuffledDropdownOptions.map((optionText, index) => {
        return (
          <option key={index} value={optionText}>
            {optionText}
          </option>
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(ReturnOptions);
