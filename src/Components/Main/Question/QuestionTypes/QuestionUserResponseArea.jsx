//Import Question Types
import MultipleChoice from "./MultipleChoice/MultipleChoice.js";
import MultipleResponse from "./MultipleResponse/MultipleResponse.js";
import GapText from "./GapText/GapText.js";
import GapTextDropdown from "./GapTextDropdown/GapTextDropdown.js";
import ExtendedMatch from "./ExtendedMatch/ExtendedMatch.js";

//Switch
const Switch = ({ questionType, children }) => {
  //Return the empty component if question type is undefined
  if (questionType === undefined) {
    throw new Error("Question Type not defined!");
  }

  //Find the question type
  const child = children.find((child) => child.props.name === questionType);

  //Return child component (see QuestionUserResponse inside the Switch) if it's not undefined
  if (child !== undefined) {
    return child;
  } else {
    throw new Error(`Couldn't find ${questionType} `);
  }
};

const QuestionUserResponseArea = ({ type, options, showAnswer, questionAnswerRef }) => {
  return (
    <section className='question-user-response'>
      <Switch questionType={type}>
        <MultipleChoice name='multiple-choice' options={options} formDisabled={showAnswer} ref={questionAnswerRef} />
        <MultipleResponse
          name='multiple-response'
          options={options}
          formDisabled={showAnswer}
          ref={questionAnswerRef}
        />
        <GapText name='gap-text' options={options} formDisabled={showAnswer} ref={questionAnswerRef} />
        <GapTextDropdown name='gap-text-dropdown' options={options} formDisabled={showAnswer} ref={questionAnswerRef} />
        <ExtendedMatch name='extended-match' options={options} formDisabled={showAnswer} ref={questionAnswerRef} />
      </Switch>
    </section>
  );
};

export default QuestionUserResponseArea;
