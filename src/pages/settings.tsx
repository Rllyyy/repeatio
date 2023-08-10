import { Settings } from "../components/Settings";
import { SiteHeading } from "../components/SiteHeading/SiteHeading";

const SettingsPage = () => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <SiteHeading title='Settings' />
      <Settings />
    </div>
  );
};

export default SettingsPage;
