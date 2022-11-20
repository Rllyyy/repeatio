import { useState } from "react";

//Icons
import { RiFileEditLine } from "react-icons/ri";

//Components
import { QuestionEditor } from "../../../QuestionEditor/QuestionEditor";

interface EditQuestionI {
  prevQuestionID: string;
  disabled: boolean;
}

export const EditQuestion = ({ prevQuestionID, disabled }: EditQuestionI) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };
  return (
    <>
      <button type='button' onClick={() => setShowModal(true)} disabled={disabled} aria-label='Edit Question'>
        <RiFileEditLine />
      </button>
      {showModal && <QuestionEditor handleModalClose={handleModalClose} prevQuestionID={prevQuestionID} />}
    </>
  );
};
