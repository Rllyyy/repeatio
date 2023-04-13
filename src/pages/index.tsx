//Components
import { Modules } from "../components/Home/Modules";
import { AddModule } from "../components/Home/AddModule";
import { SiteHeading } from "../components/SiteHeading/SiteHeading";
import { TModuleSortOption, SortButton } from "../components/Home/ModuleSortButton";
import { useState } from "react";

// CSS
import "../components/Home/Home.css";

const Home = () => {
  const [sort, setSort] = useState<TModuleSortOption>("Name (ascending)");

  return (
    <>
      <SiteHeading title='Module Overview'>
        <div className='sort-add-module-container'>
          <SortButton sort={sort} setSort={setSort} />
          <AddModule />
        </div>
      </SiteHeading>
      <Modules sort={sort} />
    </>
  );
};

export default Home;
