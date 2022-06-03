import React from "react";
import "./Home.css";

//Components
import GridCards from "./Components/GridCards.js";

const Home = () => {
  return (
    <>
      <h1 className='site-heading'>Module Overview</h1>
      <GridCards />
    </>
  );
};

export default Home;
