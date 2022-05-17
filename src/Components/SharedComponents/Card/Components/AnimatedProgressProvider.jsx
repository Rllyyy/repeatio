import React, { useState, useEffect } from "react";
import { Animate } from "react-move";

//Animate the progress bar
//Pre 16.8 react code can be found here: https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
const AnimatedProgressProvider = ({ valueStart, valueEnd, duration, easingFunction, children }) => {
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

export default AnimatedProgressProvider;
