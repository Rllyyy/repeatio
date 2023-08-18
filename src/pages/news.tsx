import { SiteHeading } from "../components/SiteHeading/SiteHeading";

export default function NewsPage() {
  return (
    <>
      <SiteHeading title='News' />
      <p style={{ marginTop: "20px" }}>There seems to be nothing here...</p>
      <p>
        Visit <a href='https://github.com/Rllyyy/repeatio'>Github</a> to view the current status of this project.
      </p>
    </>
  );
}
