import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Icons
import { RiFileEditLine } from "react-icons/ri";

// Components
import { QuestionEditor } from "../../../QuestionEditor/QuestionEditor";
import { ComponentWithTooltip } from "@components/common/ComponentWithTooltip";

// Interfaces
import { IQuestion, TUseQuestion } from "../../useQuestion";
import { IParams } from "../../../../utils/types";

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
  const { questionID } = useParams<IParams>();

  const handleModalClose = () => {
    setShowModal(false);
  };

  /* Hide the modal if the question id changes (could happen on navigation back for example) */
  useEffect(() => {
    return () => {
      setShowModal(false);
    };
  }, [questionID]);

  return (
    <>
      <ComponentWithTooltip id='edit-question-tooltip' tooltipText='Edit Question'>
        <button type='button' onClick={() => setShowModal(true)} disabled={disabled} aria-label='Edit Question'>
          <RiFileEditLine />
        </button>
      </ComponentWithTooltip>
      {prevQuestion && (
        <QuestionEditor
          showModal={showModal}
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
