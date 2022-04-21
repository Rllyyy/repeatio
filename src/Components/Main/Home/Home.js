import React from "react";
import "./Home.css";

//Components
import GridCards from "./Components/GridCards.js";

const Home = () => {
  return (
    <>
      <div className='main-heading-wrapper'>
        <h1>Your Modules</h1>
        <div className='heading-underline'></div>
      </div>
      <GridCards />
    </>
  );
};

export default Home;
