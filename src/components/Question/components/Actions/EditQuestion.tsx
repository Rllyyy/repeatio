import { useState } from "react";

// Icons
import { RiFileEditLine } from "react-icons/ri";

// Components
import { QuestionEditor } from "../../../QuestionEditor/QuestionEditor";

// Interfaces
import { IQuestion, TUseQuestion } from "../../useQuestion";

interface IEditQuestion {
  prevQuestion: IQuestion | undefined;
  disabled: boolean;
  fetchQuestion: TUseQuestion["fetchQuestion"];
  handleResetQuestionComponent: TUseQuestion["handleResetQuestionComponent"];
}

// Component
export const EditQuestion = ({
  prevQuestion,
  disabled,
  fetchQuestion,
  handleResetQuestionComponent,
}: IEditQuestion) => {
  const [showModal, setShowModal] = useState(false);

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button type='button' onClick={() => setShowModal(true)} disabled={disabled} aria-label='Edit Question'>
        <RiFileEditLine />
      </button>
      {prevQuestion && showModal && (
        <QuestionEditor
          mode='edit'
          handleModalClose={handleModalClose}
          prevQuestion={prevQuestion}
          fetchQuestion={fetchQuestion}
          handleResetQuestionComponent={handleResetQuestionComponent}
        />
      )}
    </>
  );
};
