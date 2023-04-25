import { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

//CSS
import "react-circular-progressbar/dist/styles.css";

//Progress Component
export const ProgressPie = ({ progress }: { progress: number }) => {
  //https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
  return (
    <ProgressProvider valueStart={0} valueEnd={progress}>
      {(value: number) => {
        const roundedValue = Math.round(value);
        return (
          <CircularProgressbar
            className='progress'
            value={value}
            text={`${roundedValue}%`}
            styles={buildStyles({
              pathColor: "var(--custom-prime-color)",
              trailColor: "rgb(230, 230, 230)",
              textSize: "1.2rem",
              textColor: "rgb(75, 75, 75)",
              pathTransitionDuration: 0.7,
              pathTransition: "ease-in-out",
            })}
          />
        );
      }}
    </ProgressProvider>
  );
};

// The animation was previously handled by react-move but there is no support for react 18
// https://github.com/sghall/react-move/issues/88
type TProgressProvider = {
  valueStart: number;
  valueEnd: number;
  children: (value: number) => React.ReactElement;
};

const ProgressProvider: React.FC<TProgressProvider> = ({ valueStart, valueEnd, children }) => {
  const [value, setValue] = useState(valueStart);
  useEffect(() => {
    setValue(valueEnd);

    return () => {
      setValue(valueStart);
    };
  }, [valueEnd]);

  return children(value);
};
