import { useState } from "react";
import PropTypes from "prop-types";
import isElectron from "is-electron";
import packageJson from "../../../package.json";

export const CreateModule = ({ handleModalClose }) => {
  const [module, setModule] = useState({ compatibility: packageJson.version, questions: [] });

  //Update the module state
  const handleInputChange = (e) => {
    setModule({ ...module, [e.target.name]: e.target.value });
  };

  //Update the localStorage on form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    //prevent using electron for this time
    //TODO add ability to use electron
    if (isElectron()) {
      console.warn("Can't create modules in electron for this time");
      return;
    }

    //TODO
    //Check if Item (id) already exists in storage, then update the existing module.
    //Right now it just replaces the old module in the localStorage with the uploaded one. */

    //Update localeStorage and tell the window that a new storage event occurred
    localStorage.setItem(`repeatio-module-${module.id}`, JSON.stringify(module, null, "\t"), {
      sameSite: "strict",
      secure: true,
    });
    window.dispatchEvent(new Event("storage"));

    handleModalClose();
  };

  //JSX
  return (
    <form className='create-module' onSubmit={handleFormSubmit}>
      <h2>Create new Module</h2>
      {/* Module ID */}
      <div className='create-module-id'>
        <label htmlFor='create-module-id-input'>ID</label>
        <input
          type='text'
          id='create-module-id-input'
          value={module.id || ""}
          spellCheck='false'
          name='id'
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Module Name */}
      <div className='create-module-name'>
        <label htmlFor='create-module-name-input'>Name</label>
        <input
          type='text'
          id='create-module-name-input'
          value={module.name || ""}
          spellCheck='false'
          name='name'
          onChange={handleInputChange}
          required
        />
      </div>
      {/* Compatibility Info (Version of repeatio) */}
      <div className='create-module-compatibility'>
        <label htmlFor='create-module-compatibility-input'>Compatibility Version</label>
        <input
          type='text'
          id='create-module-compatibility-input'
          spellCheck='false'
          name='compatibility'
          value={module.compatibility}
          disabled
          required
        />
      </div>
      <button type='submit' className='create-module-btn'>
        Create
      </button>
    </form>
  );
};

CreateModule.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
};
