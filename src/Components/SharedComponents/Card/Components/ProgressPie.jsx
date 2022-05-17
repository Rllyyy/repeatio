import React from "react";
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { easeQuadInOut } from "d3-ease";

//CSS
import "react-circular-progressbar/dist/styles.css";

//Components
import AnimatedProgressProvider from "./AnimatedProgressProvider.jsx";

//Component
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

ProgressPie.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default ProgressPie;
