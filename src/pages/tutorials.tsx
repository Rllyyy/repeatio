import { SiteHeading } from "../components/SiteHeading/SiteHeading";
import { Tutorials } from "../components/Tutorials";

const TutorialsPage = () => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <SiteHeading title='Tutorials' />
      <Tutorials />
    </div>
  );
};

export default TutorialsPage;
