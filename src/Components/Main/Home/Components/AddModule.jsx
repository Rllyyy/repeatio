import { useState } from "react";
import PropTypes from "prop-types";

//Components
import CustomModal from "../../../SharedComponents/CustomModal/CustomModal.js";
import ImportModule from "./ImportModule/ImportModule.jsx";
import CreateModule from "./ImportModule/CreateModule/CreateModule.jsx";

//CSS
import "./AddModule.css";

const AddModule = () => {
  const [showModal, setShowModal] = useState(false);

  //Close modal by setting the show modal state to false
  const handleModalClose = () => {
    setShowModal(false);
  };

  //JSX
  return (
    <>
      <button className='create-import-module-btn' onClick={() => setShowModal(true)}>
        <p>Add Module</p>
      </button>
      {showModal && (
        <CustomModal
          handleModalClose={handleModalClose}
          title='Import or Create a Module'
          desktopModalHeight='fit-content'
        >
          <div className='import-create-module'>
            <ImportModule handleModalClose={handleModalClose} />
            <div className='line'></div>
            <CreateModule handleModalClose={handleModalClose} />
          </div>
        </CustomModal>
      )}
    </>
  );
};

ImportModule.propTypes = {
  handleModalClose: PropTypes.func.isRequired,
};

export default AddModule;
