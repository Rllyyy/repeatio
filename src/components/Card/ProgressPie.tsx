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
  children: (value: number) => React.ReactElement;
};

//Animate the progress bar
//Pre 16.8 react code can be found here: https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
const AnimatedProgressProvider: React.FC<TAnimatedProgressProvider> = ({
  valueStart,
  valueEnd,
  duration,
  easingFunction,
  children,
}) => {
  // State to track whether the animation is currently running
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger the animation to start on component mount
  useEffect(() => {
    setIsAnimated(true);
    // Clean up the animation state when the component unmounts
    return () => {
      setIsAnimated(false);
    };
  }, []);

  // JSX for the component
  return (
    // Use the Animate component to control the animation
    <Animate
      // Set the starting value for the animation
      start={() => ({
        value: valueStart,
      })}
      // Update the animation value and timing
      update={() => ({
        // Use the current value of `isAnimated` to determine the end value for the animation
        value: [isAnimated ? valueEnd : valueStart],
        timing: {
          // Convert the duration from seconds to milliseconds
          duration: duration * 1000,
          // Use the provided easing function
          ease: easingFunction,
        },
      })}
    >
      {/* Render the children with the current value of the animation */}
      {({ value }) => children(value)}
    </Animate>
  );
};
