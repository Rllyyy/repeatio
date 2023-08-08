import { useSetting } from "../../hooks/useSetting";
import style from "./tutorials.module.css";

export const Tutorials = () => {
  return (
    <article
      style={{
        padding: "16px",
        border: "1px solid lightgray",
        backgroundColor: "white",
        borderRadius: "8px",
        marginTop: "4px",
      }}
    >
      <Video />
      <h2 style={{ marginTop: "12px", lineHeight: 1.2 }}>repeatio - Eine interaktive Lernplattform (Tutorial)</h2>
      <p style={{ marginTop: "8px", color: "#111827" }}>
        In diesem Tutorial werden die Grundlagen der Lernplattform repeatio.de erläutert.
      </p>
      <p style={{ marginTop: "4px", fontSize: "medium", color: "#4b5563" }}>
        Link zur Plattform: <a href='https://www.repeatio.de'>www.repeatio.de</a>
      </p>
      <p style={{ fontSize: "medium", color: "#4b5563" }}>
        Dokumentation/Source Code: <a href='https://www.github.com/Rllyyy/repeatio'>www.github.com/Rllyyy/repeatio</a>
      </p>
      <p style={{ fontSize: "medium", color: "#4b5563" }}>
        E-Mail: <a href='mailto:contact@repeatio.de'>contact@repeatio.de</a>
      </p>
    </article>
  );
};

const Video = () => {
  const [hasConsent, setHasConsent] = useSetting("embedYoutubeVideos", false);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "16 / 9",
        }}
      >
        {hasConsent ? (
          <iframe
            src='https://www.youtube-nocookie.com/embed/Rqsy0nL4WK8'
            title='YouTube video player'
            style={{ height: "100%", width: "100%", border: "none" }}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            allowFullScreen
          ></iframe>
        ) : (
          <YouTubeConsentForm setHasConsent={setHasConsent} />
        )}
      </div>
      {/*  <button type='button' onClick={() => setHasConsent(false)}>
        Reset
      </button> */}
    </>
  );
};

type TYouTubeConsentForm = {
  setHasConsent: (newValue: boolean) => void;
};

const YouTubeConsentForm: React.FC<TYouTubeConsentForm> = ({ setHasConsent }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasConsent(true);
  };
  return (
    <form
      style={{
        background: "#111827",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        borderRadius: "4px",
        rowGap: "8px",
      }}
      onSubmit={handleSubmit}
    >
      <h3 style={{ fontWeight: 600, color: "var(--custom-tertiary-color)" }}>Activate external Media</h3>
      <p style={{ color: "#d4d4d8", fontSize: "medium" }}>
        This video is embedded in Youtube's extended data protection mode, which blocks the setting of Youtube cookies
        until an active click is made on the playback. By clicking on the play button, you consent to YouTube setting
        cookies on the device you are using which can be used for market research and marketing purposes. If you are
        logged into your YouTube account, YouTube can associate your browsing behavior with you personally. You can find
        more details on the use of cookies by YouTube in{" "}
        <a
          style={{ color: "#a5b4fc" }}
          href='https://policies.google.com/technologies/types?hl=de'
          className='text-indigo-400'
        >
          Google's Cookie-Policy
        </a>
        . You can revoke your consent in the settings tab. To delete the data saved by Google please contact Google
        directly.
      </p>
      <button type='submit' className={style["consent-button"]}>
        I understand
      </button>
    </form>
  );
};
