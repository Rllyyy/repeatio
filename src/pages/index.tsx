//Components
import { Modules } from "../components/Home/Modules";
import { AddModule } from "../components/Home/AddModule";
import { SiteHeading } from "../components/SiteHeading/SiteHeading";
import { SortButton } from "../components/Home/ModuleSortButton";

// CSS
import "../components/Home/Home.css";
import { useSetting } from "../hooks/useSetting";

export default function Home() {
  const [sort, setSort] = useSetting("moduleSort", "Name (ascending)");

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
}
