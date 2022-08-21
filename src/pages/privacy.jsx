import { SiteHeading } from "../components/SiteHeading/SiteHeading";
import "../components/Privacy/Privacy.css";

export const PrivacyPage = () => {
  return (
    <div className='privacy'>
      <SiteHeading title='Datenschutzerklärung' />
      <div className='content'>
        <h2 style={{ marginTop: "1.5rem" }}>1. Datenschutz auf einen Blick</h2>
        <h3 style={{ marginTop: ".5rem" }}>Allgemeine Hinweise</h3>
        <p>
          Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
          passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
          identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter
          diesem Text aufgeführten Datenschutzerklärung.
        </p>
        <h3>Datenerfassung auf dieser Website</h3>
        <h4 style={{ marginTop: ".4rem" }}>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h4>
        <p>
          Die Datenverarbeitung auf dieser Website erfolgt einerseits durch den Websitebetreiber und andererseits durch
          den Hoster (Netlify Inc.). Die Kontaktdaten des Websitebetreibers können Sie dem Abschnitt "Hinweis zur
          Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.
        </p>
        <h4>Was sind personenbezogene Daten?</h4>
        <p>
          "Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare
          natürliche Person („betroffene Person“) beziehen; als identifizierbar wird eine natürliche Person angesehen,
          die direkt oder indirekt, insbesondere mittels Zuordnung zu einer Kennung wie einem Namen, zu einer
          Kennnummer, zu Standortdaten, zu einer Online-Kennung oder zu einem oder mehreren besonderen Merkmalen der
          physischen, physiologischen, genetische, geistige, wirtschaftliche, kulturelle oder soziale Identität dieser
          natürlichen Person." (Art. 4 GDPR)
        </p>
        <h4>Welche Daten werden erfasst?</h4>
        <p>
          Unsere Website erfasst keine personenbezogenen Daten (Name, Adresse, Telefonnummer oder E-Mail Adresse), außer
          Sie stellen uns diese freiwillig zur Verfügung (z. B. Kontaktaufnahme über E-Mail). Jedoch wird Ihr Besuch auf
          unserer Website durch IT-Systeme erfasst, welche durch Netlify Inc. verwaltet werden. In diesem Zusammenhang
          werden die aktuelle IP-Adresse ihres Computers in anonymisierter Form, die besuchten (Unter-) Websites, Ihr
          Broswer und Betriebssystem, Datum, Uhrzeit und Dauer Ihres Besuchs erfasst. Die Erfassung dieser Daten erfolgt
          automatisch, sobald Sie diese Website betreten. Daten, die Sie auf der Website eingeben (Einstellungen,
          Module, gespeicherte Fragen, etc. pp.), verbleiben in ihrem Browser und werden nicht von uns verarbeitet.
        </p>
        <h4>Wofür nutzen wir Ihre Daten?</h4>
        <p>
          Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere
          (anonymisierter) Daten werden zur Analyse Ihres Nutzerverhaltens durch Netlify Inc. verwendet. Weitere
          Informationen diesbezüglich finden Sie im Abschnitt "Externes Hosting".
        </p>
        <h4>Welche Rechte haben Sie bezüglich Ihrer Daten?</h4>
        <p>
          Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten
          personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten
          zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
          jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die
          Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein
          Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
        </p>
        <p>Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns wenden.</p>
        <h2>2. Hosting</h2>
        <h3 style={{ marginTop: ".5rem" }}>Externes Hosting</h3>
        <p>
          Diese Website wird bei einem externen Dienstleister Netlify gehostet (Hoster). Die personenbezogenen Daten,
          die auf dieser Website erfasst werden, werden auf den Servern des Hosters in Log Files gespeichert. Hierbei
          kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten,
          Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
          Diese Daten werden 30 Tagen nach Ihrem Besuch auf unserer Website gelöscht. Netlify verwendet diese Daten
          ausschließlich für Netzwerkanalysen und und kombiniert diese nicht mit anderen idenfizierenden Daten.
        </p>
        <p>
          Der Einsatz des Hosters erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und
          bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und effizienten
          Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
          Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage
          von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG, soweit die Einwilligung die Speicherung von Cookies oder
          den Zugriff auf Informationen im Endgerät des Nutzers (z. B. Device-Fingerprinting) im Sinne des TTDSG
          umfasst. Die Einwilligung ist jederzeit widerrufbar.
        </p>
        <p>
          Unser Hoster wird Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung seiner Leistungspflichten
          erforderlich ist und unsere Weisungen in Bezug auf diese Daten befolgen.
        </p>
        <p>Wir setzen folgenden Hoster ein:</p>
        <br />
        <p>
          Netlify, Inc., <br />
          44 Montgomery Street, Suite 300, <br />
          San Francisco, California 94104 <br />
          Netlify's Website: <a href='https://www.netlify.com/'>https://www.netlify.com/</a> <br />
          Netlify's Verpflichtung zum Schutz Ihrer Daten:{" "}
          <a href='https://www.netlify.com/gdpr-ccpa/'>https://www.netlify.com/gdpr-ccpa/</a>
        </p>
        <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
        <h3 style={{ marginTop: ".5rem" }}>Datenschutz</h3>
        <p>
          Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
          personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser
          Datenschutzerklärung.
        </p>
        <p>
          Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene Daten
          sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende Datenschutzerklärung
          erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das
          geschieht.
        </p>
        <p>
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail)
          Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht
          möglich.
        </p>
        <h3>Hinweis zur verantwortlichen Stelle</h3>
        <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
        <br />
        <div className='info'>
          <p>Niklas Fischer</p>
          <div id='loc'>
            <span>Lottbeker Weg</span>
            <span>4</span>
            <span>2</span>
            <span>6</span>
            <span>7</span>
          </div>
          <p>22397 Hamburg</p>
          <p>E-Mail: repeatio.dev[aet]gmail.com</p>
        </div>
        <br />
        <p>
          Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über
          die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, E-Mail-Adressen o. Ä.)
          entscheidet.
        </p>
        <h3>Speicherdauer</h3>
        <p>
          Unsere Website speichert alle nicht personenbezogenen Daten (Einstellungen, Module, gespeicherte Fragen, etc.
          pp.) als Cookie im lokalen Speicher (engl. local Storage) ihres Browsers. Die Daten werden dort so lange
          gespeichert, bis sie von Ihnen gelöscht werden. Personenbezogene Daten verbleiben bei uns, bis der Zweck für
          die Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung
          zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen
          Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer- oder handelsrechtliche
          Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall dieser Gründe. Für die
          Speicherdauer durch Netlify Inc. lesen Sie sich bitte den Abschnitt "Externes Hosting" durch. Nähere
          Informationen bezüglich der Speicherdauer aus einer Kontaktaufnahme entnehmen Sie dem Abschnitt "Anfrage per
          E-Mail oder Telefon".
        </p>
        <h3>Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website</h3>
        <p>
          Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre personenbezogenen Daten auf
          Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien
          nach Art. 9 Abs. 1 DSGVO verarbeitet werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung
          personenbezogener Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf Grundlage von Art. 49 Abs.
          1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies oder in den Zugriff auf Informationen in Ihr
          Endgerät (z. B. via Device-Fingerprinting) eingewilligt haben, erfolgt die Datenverarbeitung zusätzlich auf
          Grundlage von § 25 Abs. 1 TTDSG. Die Einwilligung ist jederzeit widerrufbar. Sind Ihre Daten zur
          Vertragserfüllung oder zur Durchführung vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten
          auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur
          Erfüllung einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c DSGVO. Die
          Datenverarbeitung kann ferner auf Grundlage unseres berechtigten Interesses nach Art. 6 Abs. 1 lit. f DSGVO
          erfolgen. Über die jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den folgenden Absätzen dieser
          Datenschutzerklärung informiert.
        </p>
        <h3>Hinweis zur Datenweitergabe in die USA und sonstige Drittstaaten</h3>
        <p>
          Wir verwenden unter anderem Tools von Unternehmen mit Sitz in den USA oder sonstigen datenschutzrechtlich
          nicht sicheren Drittstaaten. Wenn diese Tools aktiv sind, können Ihre personenbezogene Daten in diese
          Drittstaaten übertragen und dort verarbeitet werden. Wir weisen darauf hin, dass in diesen Ländern kein mit
          der EU vergleichbares Datenschutzniveau garantiert werden kann. Beispielsweise sind US-Unternehmen dazu
          verpflichtet, personenbezogene Daten an Sicherheitsbehörden herauszugeben, ohne dass Sie als Betroffener
          hiergegen gerichtlich vorgehen könnten. Es kann daher nicht ausgeschlossen werden, dass US-Behörden (z. B.
          Geheimdienste) Ihre auf US-Servern befindlichen Daten zu Überwachungszwecken verarbeiten, auswerten und
          dauerhaft speichern. Wir haben auf diese Verarbeitungstätigkeiten keinen Einfluss.
        </p>
        <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
        <p>
          Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine
          bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten
          Datenverarbeitung bleibt vom Widerruf unberührt.
        </p>
        <h3>
          Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung (Art. 21 DSGVO)
        </h3>
        <p>
          WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO ERFOLGT, HABEN SIE JEDERZEIT
          DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER
          PERSONENBEZOGENEN DATEN WIDERSPRUCH EINZULEGEN; DIES GILT AUCH FÜR EIN AUF DIESE BESTIMMUNGEN GESTÜTZTES
          PROFILING. DIE JEWEILIGE RECHTSGRUNDLAGE, AUF DENEN EINE VERARBEITUNG BERUHT, ENTNEHMEN SIE DIESER
          DATENSCHUTZERKLÄRUNG. WENN SIE WIDERSPRUCH EINLEGEN, WERDEN WIR IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT
          MEHR VERARBEITEN, ES SEI DENN, WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG NACHWEISEN, DIE
          IHRE INTERESSEN, RECHTE UND FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG DIENT DER GELTENDMACHUNG, AUSÜBUNG
          ODER VERTEIDIGUNG VON RECHTSANSPRÜCHEN (WIDERSPRUCH NACH ART. 21 ABS. 1 DSGVO).
        </p>
        <p>
          WERDEN IHRE PERSONENBEZOGENEN DATEN VERARBEITET, UM DIREKTWERBUNG ZU BETREIBEN, SO HABEN SIE DAS RECHT,
          JEDERZEIT WIDERSPRUCH GEGEN DIE VERARBEITUNG SIE BETREFFENDER PERSONENBEZOGENER DATEN ZUM ZWECKE DERARTIGER
          WERBUNG EINZULEGEN; DIES GILT AUCH FÜR DAS PROFILING, SOWEIT ES MIT SOLCHER DIREKTWERBUNG IN VERBINDUNG STEHT.
          WENN SIE WIDERSPRECHEN, WERDEN IHRE PERSONENBEZOGENEN DATEN ANSCHLIESSEND NICHT MEHR ZUM ZWECKE DER
          DIREKTWERBUNG VERWENDET (WIDERSPRUCH NACH ART. 21 ABS. 2 DSGVO).
        </p>
        <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
        <p>
          Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer Aufsichtsbehörde,
          insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres Arbeitsplatzes oder des Orts des
          mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
          gerichtlicher Rechtsbehelfe.
        </p>
        <h3>Recht auf Datenübertragbarkeit</h3>
        <p>
          Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
          automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
          aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen
          verlangen, erfolgt dies nur, soweit es technisch machbar ist.
        </p>
        <h3>Auskunft, Löschung und Berichtigung</h3>
        <p>
          Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft
          über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
          Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren
          Fragen zum Thema personenbezogene Daten können Sie sich jederzeit an uns wenden.
        </p>
        <h3>Recht auf Einschränkung der Verarbeitung</h3>
        <p>
          Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Hierzu
          können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der Verarbeitung besteht in folgenden
          Fällen:
        </p>
        <ul>
          <li>
            Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten, benötigen wir in
            der Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht, die Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
          <li>
            Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht, können Sie statt der
            Löschung die Einschränkung der Datenverarbeitung verlangen.
          </li>
          <li>
            Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder
            Geltendmachung von Rechtsansprüchen benötigen, haben Sie das Recht, statt der Löschung die Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
          <li>
            Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren und
            unseren Interessen vorgenommen werden. Solange noch nicht feststeht, wessen Interessen überwiegen, haben Sie
            das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
        </ul>
        <p>
          Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten eingeschränkt haben, dürfen diese Daten - von ihrer
          Speicherung abgesehen - nur mit Ihrer Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von
          Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder juristischen Person oder aus
          Gründen eines wichtigen öffentlichen Interesses der Europäischen Union oder eines Mitgliedstaats verarbeitet
          werden.
        </p>
        <h3>SSL- bzw. TLS-Verschlüsselung</h3>
        <p>
          Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum
          Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL- bzw.
          TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von
          "http://"" auf "https://"; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
        </p>
        <p>
          Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von
          Dritten mitgelesen werden.
        </p>
        <h2>4. Datenerfassung auf dieser Website</h2>
        <h3 style={{ marginTop: ".5rem" }}>Cookies</h3>
        <p>
          Unsere Internetseiten verwenden so genannte "Cookies". Cookies sind kleine Textdateien und richten auf Ihrem
          Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies)
          oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach Ende Ihres
          Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst
          löschen oder eine automatische Löschung durch Ihren Webbrowser erfolgt.
        </p>
        <p>
          Teilweise können auch Cookies von Drittunternehmen auf Ihrem Endgerät gespeichert werden, wenn Sie unsere
          Seite betreten (Third-Party-Cookies). Diese ermöglichen uns oder Ihnen die Nutzung bestimmter Dienstleistungen
          des Drittunternehmens (z. B. Cookies zur Abwicklung von Zahlungsdienstleistungen).
        </p>
        <p>
          Cookies haben verschiedene Funktionen. Zahlreiche Cookies sind technisch notwendig, da bestimmte
          Websitefunktionen ohne diese nicht funktionieren würden (z. B. die Warenkorbfunktion oder die Anzeige von
          Videos). Andere Cookies dienen dazu, das Nutzerverhalten auszuwerten oder Werbung anzuzeigen.
        </p>
        <p>
          Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs, zur Bereitstellung bestimmter, von
          Ihnen erwünschter Funktionen (z. B. für die Warenkorbfunktion) oder zur Optimierung der Website (z. B. Cookies
          zur Messung des Webpublikums) erforderlich sind (notwendige Cookies), werden auf Grundlage von Art. 6 Abs. 1
          lit. f DSGVO gespeichert, sofern keine andere Rechtsgrundlage angegeben wird. Der Websitebetreiber hat ein
          berechtigtes Interesse an der Speicherung von notwendigen Cookies zur technisch fehlerfreien und optimierten
          Bereitstellung seiner Dienste. Sofern eine Einwilligung zur Speicherung von Cookies und vergleichbaren
          Wiedererkennungstechnologien abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage dieser
          Einwilligung (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG); die Einwilligung ist jederzeit widerrufbar.
        </p>
        <p>
          Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur
          im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle oder generell ausschließen sowie das
          automatische Löschen der Cookies beim Schließen des Browsers aktivieren. Bei der Deaktivierung von Cookies
          kann die Funktionalität dieser Website eingeschränkt sein.
        </p>
        <p>
          Soweit Cookies von Drittunternehmen oder zu Analysezwecken eingesetzt werden, werden wir Sie hierüber im
          Rahmen dieser Datenschutzerklärung gesondert informieren und ggf. eine Einwilligung abfragen.
        </p>
        <h3>Anfrage per E-Mail oder Telefon</h3>
        <p>
          Wenn Sie uns per E-Mail oder Telefon kontaktieren, wird Ihre Anfrage inklusive aller daraus hervorgehenden
          personenbezogenen Daten (Name, Anfrage) zum Zwecke der Bearbeitung Ihres Anliegens bei uns gespeichert und
          verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
        </p>
        <p>
          Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit
          der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist.
          In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven
          Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6
          Abs. 1 lit. a DSGVO) sofern diese abgefragt wurde; die Einwilligung ist jederzeit widerrufbar.
        </p>
        <p>
          Die von Ihnen an uns per Kontaktanfragen übersandten Daten verbleiben bei uns, bis Sie uns zur Löschung
          auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z.
          B. nach abgeschlossener Bearbeitung Ihres Anliegens). Zwingende gesetzliche Bestimmungen - insbesondere
          gesetzliche Aufbewahrungsfristen - bleiben unberührt.
        </p>
        {/* <h2>5. Plugins und Tools</h2>
        <h3 style={{ marginTop: ".5rem" }}>YouTube mit erweitertem Datenschutz</h3>
        <p>
          Diese Website bindet Videos der YouTube ein. Betreiber der Seiten ist die Google Ireland Limited ("Google"),
          Gordon House, Barrow Street, Dublin 4, Irland.
        </p>
        <p>
          Wir nutzen YouTube im erweiterten Datenschutzmodus. Dieser Modus bewirkt laut YouTube, dass YouTube keine
          Informationen über die Besucher auf dieser Website speichert, bevor diese sich das Video ansehen. Die
          Weitergabe von Daten an YouTube-Partner wird durch den erweiterten Datenschutzmodus hingegen nicht zwingend
          ausgeschlossen. So stellt YouTube - unabhängig davon, ob Sie sich ein Video ansehen - eine Verbindung zum
          Google DoubleClick-Netzwerk her.
        </p>
        <p>
          Sobald Sie ein YouTube-Video auf dieser Website starten, wird eine Verbindung zu den Servern von YouTube
          hergestellt. Dabei wird dem YouTube-Server mitgeteilt, welche unserer Seiten Sie besucht haben. Wenn Sie in
          Ihrem YouTube-Account eingeloggt sind, ermöglichen Sie YouTube, Ihr Surfverhalten direkt Ihrem persönlichen
          Profil zuzuordnen. Dies können Sie verhindern, indem Sie sich aus Ihrem YouTube-Account ausloggen.
        </p>
        <p>
          Des Weiteren kann YouTube nach Starten eines Videos verschiedene Cookies auf Ihrem Endgerät speichern oder
          vergleichbare Wiedererkennungstechnologien (z. B. Device-Fingerprinting) einsetzen. Auf diese Weise kann
          YouTube Informationen über Besucher dieser Website erhalten. Diese Informationen werden u. a. verwendet, um
          Videostatistiken zu erfassen, die Anwenderfreundlichkeit zu verbessern und Betrugsversuchen vorzubeugen.
        </p>
        <p>
          Gegebenenfalls können nach dem Start eines YouTube-Videos weitere Datenverarbeitungsvorgänge ausgelöst werden,
          auf die wir keinen Einfluss haben.
        </p>
        <p>
          Die Nutzung von YouTube erfolgt im Interesse einer ansprechenden Darstellung unserer Online-Angebote. Dies
          stellt ein berechtigtes Interesse im Sinne von Art. 6 Abs. 1 lit. f DSGVO dar. Sofern eine entsprechende
          Einwilligung abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage von Art. 6 Abs. 1 lit. a
          DSGVO und § 25 Abs. 1 TTDSG, soweit die Einwilligung die Speicherung von Cookies oder den Zugriff auf
          Informationen im Endgerät des Nutzers (z. B. Device-Fingerprinting) im Sinne des TTDSG umfasst. Die
          Einwilligung ist jederzeit widerrufbar.
        </p>
        <p>
          Weitere Informationen über Datenschutz bei YouTube finden Sie in deren Datenschutzerklärung unter:
          <a href='https://policies.google.com/privacy?hl=de' target='_blank' rel='noopener noreferrer'>
            https://policies.google.com/privacy?hl=de
          </a>
          .
        </p> */}
        <br />
        <p>
          Quelle: <a href='https://www.e-recht24.de'>https://www.e-recht24.de</a>
        </p>
      </div>
    </div>
  );
};
