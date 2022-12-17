//Components
import { Modules } from "../components/Home/Modules.js";
import { AddModule } from "../components/Home/AddModule";
import { SiteHeading } from "../components/SiteHeading/SiteHeading";

const Home = () => {
  return (
    <>
      <SiteHeading title='Module Overview'>
        <AddModule />
      </SiteHeading>
      <Modules />
    </>
  );
};

export default Home;
