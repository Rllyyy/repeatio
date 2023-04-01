//Import Question Types
import { IMultipleChoice, MultipleChoice } from "./MultipleChoice/MultipleChoice";
import { IMultipleResponse, MultipleResponse } from "./MultipleResponse/MultipleResponse";
import { GapText, IGapText } from "./GapText/GapText";
import { GapTextDropdown, IGapTextDropdown } from "./GapTextDropdown/GapTextDropdown";
import { ExtendedMatch, IExtendedMatch } from "./ExtendedMatch/ExtendedMatch";

// Interfaces
import { IQuestion } from "../useQuestion";
import { IForwardRefFunctions } from "./types";

interface IQuestionUserResponseAreaProps {
  type: IQuestion["type"];
  options: IQuestion["answerOptions"];
  showAnswer: boolean;
  questionAnswerRef: React.ForwardedRef<IForwardRefFunctions>;
}

export const QuestionUserResponseArea = ({
  type,
  options,
  showAnswer,
  questionAnswerRef,
}: IQuestionUserResponseAreaProps) => {
  return (
    <section className='question-user-response'>
      <Switch questionType={type}>
        <MultipleChoice
          name='multiple-choice'
          options={options as IMultipleChoice[]}
          formDisabled={showAnswer}
          ref={questionAnswerRef}
        />
        <MultipleResponse
          name='multiple-response'
          options={options as IMultipleResponse[]}
          formDisabled={showAnswer}
          ref={questionAnswerRef}
        />
        <GapText name='gap-text' options={options as IGapText} formDisabled={showAnswer} ref={questionAnswerRef} />
        <GapTextDropdown
          name='gap-text-dropdown'
          options={options as IGapTextDropdown}
          formDisabled={showAnswer}
          ref={questionAnswerRef}
        />
        <ExtendedMatch
          name='extended-match'
          options={options as IExtendedMatch}
          formDisabled={showAnswer}
          ref={questionAnswerRef}
        />
      </Switch>
    </section>
  );
};

interface ISwitchProps {
  questionType: IQuestion["type"];
  children: React.ReactElement[];
}

//Switch to find the matching question type
const Switch = ({ questionType, children }: ISwitchProps) => {
  //Return the empty component if question type is undefined
  if (questionType === undefined) {
    throw new Error("Question Type not defined!");
  }

  //Find the question type
  const child = children?.find((child) => child.props.name === questionType);

  //Return child component (see QuestionUserResponse inside the Switch) if it's not undefined
  if (child !== undefined) {
    return child;
  } else {
    throw new Error(`Couldn't find ${questionType} `);
  }
};
