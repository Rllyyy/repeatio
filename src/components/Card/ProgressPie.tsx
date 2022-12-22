import { useState, useEffect } from "react";
import { Animate } from "react-move";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { easeQuadInOut } from "d3-ease";

//CSS
import "react-circular-progressbar/dist/styles.css";

//Progress Component
export const ProgressPie = ({ progress }: { progress: number }) => {
  //https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
  return (
    <AnimatedProgressProvider valueStart={0} valueEnd={progress} duration={0.7} easingFunction={easeQuadInOut}>
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
              pathTransition: "none",
            })}
          />
        );
      }}
    </AnimatedProgressProvider>
  );
};

type TAnimatedProgressProvider = {
  valueStart: number;
  valueEnd: number;
  duration: number;
  easingFunction: (normalizedTime: number) => number;
  children: any; //TODO fix this any
};

//Animate the progress bar
//Pre 16.8 react code can be found here: https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
const AnimatedProgressProvider = ({
  valueStart,
  valueEnd,
  duration,
  easingFunction,
  children,
}: TAnimatedProgressProvider) => {
  const [isAnimated, setIsAnimated] = useState(false);

  //Trigger animation on mount
  useEffect(() => {
    setIsAnimated(true);
    return () => {
      setIsAnimated(false);
    };
  }, []);

  //JSX
  return (
    <Animate
      start={() => ({
        value: valueStart,
      })}
      update={() => ({
        value: [isAnimated ? valueEnd : valueStart],
        timing: {
          duration: duration * 1000,
          ease: easingFunction,
        },
      })}
    >
      {({ value }) => children(value)}
    </Animate>
  );
};
