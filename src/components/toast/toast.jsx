import { useEffect } from "react";
import { ToastContainer, Slide, toast } from "react-toastify";

//css
import "react-toastify/dist/ReactToastify.css";
import "./toast.css";

/* 
  When calling a toast method (toast.success(...), ...) the ToastContainer gets created or content is pushed to an existing container.
  react-toastify by: https://fkhadra.github.io/react-toastify/introduction/
*/

export const CustomToastContainer = () => {
  //Every time a toast is rendered, show it in the console
  useEffect(() => {
    toast.onChange((payload) => {
      const { content, type, data, status } = payload;

      //TODO check if user want to log errors
      if (status === "added") {
        logToConsole({ type: type, content: content, data: data });
      }
    });

    //Don't know if this return is correct :/
    //https://github.com/fkhadra/react-toastify/issues/450
    return null;
  }, []);

  return (
    //These default values can be overwritten by passing these values to the toast (as an object)
    <ToastContainer
      position='bottom-right'
      autoClose={8000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide}
      icon={false}
      draggablePercent={60}
      theme='light'
    />
  );
};

//Log toast to console
function logToConsole({ type, data, content }) {
  let toastMessage;
  //The message should be in the content prop as a string but when using jsx in the toast,
  //the developer must pass the same message (as a string) ALSO in the data prop because the console can't render (jsx) objects
  //Throw error to notify developer that the props are missing happens when jsx is passed and no data string)
  if (typeof content === "string") {
    toastMessage = content;
  } else if (typeof data === "string") {
    toastMessage = data;
  } else {
    throw new Error(
      `data or content prop must be a string!\n Did you pass JSX to the toast and forgot to declare the data attribute?\n If you see this message and are not a developer, please create a new issue at https://github.com/Rllyyy/repeatio/issues `
    );
  }

  //Build message with time
  const messageWithTime = `[${dateWithTime()}] ${toastMessage}`;

  //Dependent on the toast type, log corresponding message
  switch (type) {
    case toast.TYPE.SUCCESS:
      console.log(messageWithTime);
      break;
    case toast.TYPE.ERROR:
      console.error(messageWithTime);
      break;
    case toast.TYPE.WARNING:
      console.warn(messageWithTime);
      break;
    case toast.TYPE.INFO:
      console.info(messageWithTime);
      break;
    case toast.TYPE.DEFAULT:
      console.log(messageWithTime);
      break;
    default:
      throw new Error("Toast type not defined!");
  }
}

//Build date with Format YYYY-MM-DD hh:mm:ss
function dateWithTime() {
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  return `${date} ${time}`;
}
