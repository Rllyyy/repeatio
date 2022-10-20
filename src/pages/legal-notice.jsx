import { SiteHeading } from "../components/SiteHeading/SiteHeading";

export const LegalNoticePage = () => {
  return (
    <div className='legal-notice'>
      <SiteHeading title='Impressum' />
      <p>
        Ich widerspreche jeder kommerziellen Verwendung und jeder sonstigen Weitergabe und anderweitigen
        Veröffentlichung der untenstehenden Daten.
      </p>
      <h2 style={{ marginTop: "2rem" }}>Angaben gemäß § 5 TMG</h2>
      <div className='info' style={{ userSelect: "none" }}>
        <p>Niklas Fischer</p>
        <div id='ans'>
          <span>Lottbeker Weg</span>
          <span id='num' style={{ display: "inline-flex" }}>
            <span style={{ order: "1", opacity: 0 }}>5</span>
            <span style={{ order: "3" }}>2</span>
            <span style={{ order: "2" }}>6</span>
            <span aria-hidden='true' style={{ order: "4", display: "none" }}>
              9
            </span>
          </span>
          <p>22397 Hamburg</p>
        </div>
      </div>
      <h2 style={{ marginTop: "2rem" }}>Kontakt</h2>
      <p className='contact-ml'>repeatio.dev[aet]gmail.com</p>
    </div>
  );
};
