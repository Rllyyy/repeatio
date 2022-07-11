import React from "react";
import "./Home.css";

//Component

//Components
import GridCards from "./Components/GridCards.js";
import AddModule from "./Components/AddModule.jsx";
import SiteHeading from "../../SharedComponents/SiteHeading/SiteHeading.jsx";

const Home = () => {
  return (
    <>
      <SiteHeading title='Module Overview'>
        <AddModule />
      </SiteHeading>
      <GridCards />
    </>
  );
};

export default Home;
