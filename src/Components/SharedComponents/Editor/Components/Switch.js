import Empty from "./Empty.js";

//Switch
const Switch = ({ questionType, children }) => {
  //Return the empty component if question type is undefined
  if (questionType === undefined) {
    return <Empty name='' />;
  }

  //Find the question type
  const child = children.find((child) => child.props.name === questionType);

  if (child !== undefined) {
    return child;
  } else {
    return <p>{questionType} isn't implemented yet!</p>;
  }
};

export default Switch;
