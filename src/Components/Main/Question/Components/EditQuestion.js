import { useState } from "react";

//Icons
import { RiFileEditLine } from "react-icons/ri";

//Components
import QuestionEditor from "../../../SharedComponents/QuestionEditor/QuestionEditor.js";

const EditQuestion = ({ prev }) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        <RiFileEditLine />
      </button>
      {showModal && <QuestionEditor isOpen={showModal} handleModalClose={handleModalClose} prevQuestion={prev} />}
    </>
  );
};

export default EditQuestion;
