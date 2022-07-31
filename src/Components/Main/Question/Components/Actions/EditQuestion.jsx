import { useState } from "react";

//Icons
import { RiFileEditLine } from "react-icons/ri";

//Components
import QuestionEditor from "../../../../SharedComponents/QuestionEditor/QuestionEditor.jsx";

const EditQuestion = ({ prevQuestionID, disabled }) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <button type='button' onClick={() => setShowModal(true)} disabled={disabled}>
        <RiFileEditLine />
      </button>
      {showModal && (
        <QuestionEditor isOpen={showModal} handleModalClose={handleModalClose} prevQuestionID={prevQuestionID} />
      )}
    </>
  );
};

export default EditQuestion;
