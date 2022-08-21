import { SiteHeading } from "../components/SiteHeading/SiteHeading";

export const LegalNoticePage = () => {
  return (
    <div className='legal-notice'>
      <SiteHeading title='Impressum' />
      <p>
        Ich widerspreche jeder kommerziellen Verwendung und jeder sonstigen Weitergabe und anderweitigen
        Veröffentlichung der untenstehenden Daten.
      </p>
      <h2>Angaben gemäß § 5 TMG</h2>
      <div className='info'>
        <p>Niklas Fischer</p>
        <div id='ans'>
          <span>Lottbeker Weg</span>
          <span id='num'>
            <span aria-hidden='true'>5</span>
            <span>2</span>
            <span>6</span>
            <span aria-hidden='true'>9</span>
          </span>
          <p>22397 Hamburg</p>
        </div>
      </div>
      <h2>Kontakt</h2>
      <p className='contact-ml'>repeatio.dev[aet]gmail.com</p>
    </div>
  );
};
