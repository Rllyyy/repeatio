import { useState } from "react";

// Icons
import { RiFileEditLine } from "react-icons/ri";

// Components
import { QuestionEditor } from "../../../QuestionEditor/QuestionEditor";

// Interfaces
import { IQuestion, TUseQuestion } from "../../useQuestion";

interface IEditQuestion {
  prevQuestionID: IQuestion["id"] | undefined;
  disabled: boolean;
  fetchQuestion: TUseQuestion["fetchQuestion"];
}

// Component
export const EditQuestion = ({ prevQuestionID, disabled, fetchQuestion }: IEditQuestion) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button type='button' onClick={() => setShowModal(true)} disabled={disabled} aria-label='Edit Question'>
        <RiFileEditLine />
      </button>
      {prevQuestionID && showModal && (
        <QuestionEditor
          mode='edit'
          handleModalClose={handleModalClose}
          prevQuestionID={prevQuestionID}
          fetchQuestion={fetchQuestion}
        />
      )}
    </>
  );
};
