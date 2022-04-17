import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { easeQuadInOut } from "d3-ease";

//Css
import "react-circular-progressbar/dist/styles.css";

//Component
import AnimatedProgressProvider from "./AnimatedProgressProvider.js";

const ProgressPie = ({ progress }) => {
  //https://codesandbox.io/s/vymm4oln6y?file=/index.js:3609-3739
  return (
    <AnimatedProgressProvider valueStart={0} valueEnd={progress} duration={0.7} easingFunction={easeQuadInOut}>
      {(value) => {
        const roundedValue = Math.round(value);
        return (
          <CircularProgressbar
            className='progress'
            value={value}
            text={`${roundedValue}%`}
            styles={buildStyles({
              pathColor: "var(--custom-prime-color)",
              trailColor: "rgb(230, 230, 230)",
              textColor: "var(--custom-secondary-color)",
              pathTransition: "none",
            })}
          />
        );
      }}
    </AnimatedProgressProvider>
  );
};

export default ProgressPie;
