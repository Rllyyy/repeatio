import { useState, useSyncExternalStore } from "react";
import { version } from "../../../package.json";

import styles from "./settings.module.css";
import { CircularBarsSpinner } from "../Spinner";
import { parseJSON } from "../../utils/parseJSON";
import { TSettings } from "../../hooks/useSetting";
import { downloadZip } from "client-zip";
import { saveFile } from "../../utils/saveFile";
import { Switch } from "./Switch";

const defaultSettings: Required<TSettings> = {
  addedExampleModule: false,
  expanded: true,
  moduleSort: "Name (ascending)",
  embedYoutubeVideos: false,
  showTooltips: true,
};

export const Settings = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const [settings, setSettings] = useSettings(defaultSettings);

  const handleUpdateSettings = <K extends keyof TSettings>(name: K, value: TSettings[K]) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocalStorageDelete = () => {
    // Delete all localStorage items starting with "repeatio-"
    // Could also use localStorage.clear but this would delete all items in the localStorage for this url which is annoying for development where the url is often localhost:3000
    Object.keys(localStorage)
      .filter((key) => key.startsWith("repeatio-"))
      .forEach((key) => {
        localStorage.removeItem(key);
      });

    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  const handleDeleteBookmarkedFiles = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setLoading(e.currentTarget.name);

    await new Promise((resolve) => setTimeout(resolve, 800));

    Object.keys(localStorage)
      .filter((key) => key.startsWith("repeatio-marked-"))
      .forEach((key) => {
        localStorage.removeItem(key);
      });

    window.dispatchEvent(new StorageEvent("settings-event"));

    setLoading(null);
  };

  const handleDeleteSettings = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setLoading(e.currentTarget.name);

    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.removeItem("repeatio-settings");
    window.dispatchEvent(new StorageEvent("settings-event"));

    setLoading(null);
  };

  const handleSettingsExport = async () => {
    const file = localStorage.getItem("repeatio-settings");

    if (file) {
      await saveFile({ file: file, name: "repeatio-settings", showSuccessToast: false });
    }
  };

  return (
    <>
      <div id='appearance'>
        <h2 className={styles.categoryHeading}>Appearance</h2>
        <form className={styles.categoryItemsWrapper}>
          <div className={styles.categoryItem}>
            <label htmlFor='switch-expanded' className={styles.settingName}>
              Expand Sidebar
            </label>
            <Switch value={settings?.expanded} callback={handleUpdateSettings} name='expanded' />
            <p className={styles.settingDescription}>Expand the sidebar.</p>
          </div>
          <div className={styles.categoryItem}>
            <label htmlFor='switch-expanded' className={styles.settingName}>
              Show Tooltips
            </label>
            <Switch value={settings?.showTooltips} callback={handleUpdateSettings} name='showTooltips' />
            <p className={styles.settingDescription}>Show a tooltip on elements</p>
          </div>
        </form>
      </div>
      <div id='privacy'>
        <h2 className={styles.categoryHeading}>Privacy</h2>
        <form className={styles.categoryItemsWrapper}>
          <div className={styles.categoryItem}>
            <label htmlFor='switch-embedYoutubeVideos' className={styles.settingName}>
              Embed YouTube Videos
            </label>
            <Switch value={settings.embedYoutubeVideos} callback={handleUpdateSettings} name='embedYoutubeVideos' />
            <p className={styles.settingDescription}>
              {/* https://www.it-recht-kanzlei.de/youtube-videos-online-shop.html */}
              YouTube videos are embedded in YouTube's extended data protection mode. By enabling this setting you
              consent to Youtube setting cookies on your device.{" "}
              <a
                href='https://policies.google.com/technologies/types?hl=en'
                target={"_blank"}
                rel='noopener noreferrer'
              >
                YouTube Cookie-Policy
              </a>
            </p>
          </div>
        </form>
      </div>
      <div id='export'>
        <h2 className={styles.categoryHeading}>Export</h2>
        <div className={styles.categoryItemsWrapper}>
          {/* Export all files */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Export all files</p>
            <button
              className={styles.exportButton}
              type='button'
              onClick={downloadAllFiles}
              aria-label='Export all files'
            >
              Export
            </button>
            <p className={styles.settingDescription}>
              Export all files including modules, bookmarked questions and settings
            </p>
          </form>
          {/* Export all modules */}
          <ExportAllModules />
          {/* Export bookmarked files */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Export bookmarked files</p>
            <button className={styles.exportButton} type='button'>
              Export
            </button>
            <p className={styles.settingDescription}>Export file containing the ids of the bookmarked questions</p>
          </form>
          {/* Export settings */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Export settings</p>
            <button
              className={styles.exportButton}
              type='button'
              onClick={handleSettingsExport}
              aria-label='Export settings'
            >
              Export
            </button>
            <p className={styles.settingDescription}>Export the settings</p>
          </form>
        </div>
      </div>
      <div id='danger-zone'>
        <h2 className={styles.categoryHeading}>Danger Zone</h2>
        {/* Delete  */}
        <div className={styles.categoryItemsWrapper}>
          {/* Delete all files */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Delete all files</p>
            <button
              className={styles.deleteButton}
              type='button'
              onClick={handleLocalStorageDelete}
              aria-label='Delete all files'
            >
              Delete
            </button>
            <p className={styles.settingDescription}>
              Delete all local files including modules, bookmarked questions and settings. This action can not be
              undone.
            </p>
          </form>
          {/* Delete all Modules (and bookmarked files) */}
          <DeleteAllModules loading={loading === "delete-all-modules"} setLoading={setLoading} />
          {/* Delete bookmarked files */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Delete bookmarked files</p>
            <button
              className={styles.deleteButton}
              type='button'
              aria-label='Delete all bookmarked files'
              onClick={handleDeleteBookmarkedFiles}
              name='delete-bookmarked-files'
            >
              <span style={{ color: loading === "delete-bookmarked-files" ? "transparent" : "", fontSize: "inherit" }}>
                Delete
              </span>
              {loading === "delete-bookmarked-files" && <CircularBarsSpinner size='m' />}
            </button>
            <p className={styles.settingDescription}>
              Delete files containing the ids of the bookmarked questions. This action can not be undone.
            </p>
          </form>
          {/* Delete settings */}
          <form className={styles.categoryItem}>
            <p className={styles.settingName}>Delete settings</p>
            <button
              className={styles.deleteButton}
              type='button'
              aria-label='Delete settings'
              onClick={handleDeleteSettings}
              name='delete-settings'
            >
              <span style={{ color: loading === "delete-settings" ? "transparent" : "", fontSize: "inherit" }}>
                Delete
              </span>
              {loading === "delete-settings" && <CircularBarsSpinner size='m' />}
            </button>
            <p className={styles.settingDescription}>
              Delete settings file and reset all settings to their default values
            </p>
          </form>
        </div>
      </div>
      <p style={{ color: "var(--custom-border-color-darker)", fontSize: "16px", marginTop: "60px" }}>
        Version: {version}
      </p>
    </>
  );
};

const ExportAllModules = () => {
  const [checked, setChecked] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const items = Object.entries(localStorage)
      .filter(([key, _]) => {
        if (checked) {
          return key.startsWith("repeatio-module-") || key.startsWith("repeatio-marked-");
        } else {
          return key.startsWith("repeatio-module-");
        }
      })
      .map(([key, value]) => {
        return {
          name: `${key}.json`,
          lastModified: new Date(),
          type: "application/json",
          input: value,
        };
      });

    if (items.length < 1) return;

    // get the ZIP stream in a Blob
    const blob = await downloadZip([...items]).blob();

    // make and click a temporary link to download the Blob
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "repeatio.zip";
    link.click();
    link.remove();
  };

  return (
    <form className={styles.categoryItem} onSubmit={handleSubmit}>
      <p className={styles.settingName}>Export modules</p>
      <button
        className={styles.exportButton}
        type='submit'
        aria-label={checked ? "Export modules and bookmarked files" : "Export modules"}
      >
        Export
      </button>
      <p className={styles.settingDescription}>Export all modules from the local storage.</p>
      <div className={styles.exportModulesIncludeBookmarkedFiles}>
        <input
          type='checkbox'
          id='export-modules-include-bookmarked'
          checked={checked}
          onChange={() => setChecked(!checked)}
        />
        <label style={{ fontSize: "1rem", color: "#616161" }} htmlFor='export-modules-include-bookmarked'>
          Include bookmarked question files
        </label>
      </div>
    </form>
  );
};

interface IDeleteAllModules {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<string | null>>;
}

const DeleteAllModules: React.FC<IDeleteAllModules> = ({ loading, setLoading }) => {
  const [checked, setChecked] = useState(true);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    setLoading((e.nativeEvent.submitter as HTMLButtonElement)?.name);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (checked) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("repeatio-module-") || key.startsWith("repeatio-marked-"))
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    } else {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("repeatio-module-"))
        .forEach((key) => {
          localStorage.removeItem(key);
        });
    }

    setLoading(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.categoryItem}>
      <p className={styles.settingName}>Delete modules</p>
      <button
        className={styles.deleteButton}
        type='submit'
        aria-label={`${checked ? "Delete all modules and bookmarked files" : "Delete all modules"}`}
        name='delete-all-modules'
      >
        <span style={{ color: loading ? "transparent" : "", fontSize: "inherit" }}>Delete</span>
        {loading && <CircularBarsSpinner size='m' />}
      </button>
      <p className={styles.settingDescription}>Delete all modules. This action can not be undone.</p>
      <div className={styles.deleteModulesIncludeBookmarkedFiles}>
        <input
          type='checkbox'
          id='deleteBookmarkedFilesWithModules'
          checked={checked}
          onChange={() => setChecked(!checked)}
          aria-label='Also delete the bookmarked files'
        />
        <label style={{ fontSize: "1rem", color: "#616161" }} htmlFor='deleteBookmarkedFilesWithModules'>
          Delete bookmarked questions file
        </label>
      </div>
    </form>
  );
};

async function downloadAllFiles() {
  // https://github.com/Touffy/client-zip
  const items = Object.entries(localStorage)
    .filter(([key, _]) => key.startsWith("repeatio-"))
    .map(([key, value]) => {
      return {
        name: `${key}.json`,
        lastModified: new Date(),
        type: "application/json",
        input: value,
      };
    });

  if (items.length < 1) return;

  // get the ZIP stream in a Blob
  const blob = await downloadZip([...items]).blob();

  // make and click a temporary link to download the Blob
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "repeatio.zip";
  link.click();
  link.remove();
}

const useSettings = (defaultSettings: Required<TSettings>) => {
  const localStorageValue = useSyncExternalStore(subscribe, getSnapShot);

  const res = parseJSON<TSettings>(localStorageValue);

  // Merge settings
  const value: Required<NonNullable<TSettings>> = Object.assign({}, defaultSettings, res);

  const setValue = (newValue: TSettings | ((prev: TSettings) => TSettings)) => {
    const updatedSettings = typeof newValue === "function" ? newValue(value) : newValue;

    localStorage.setItem("repeatio-settings", JSON.stringify(updatedSettings, null, "\t"));

    // Dispatch StorageEvent to trigger event listeners
    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  return [value, setValue] as const;
};

function getSnapShot() {
  // Get the settings from the localStorage
  const localStorageItem = localStorage.getItem("repeatio-settings");

  return localStorageItem;
}

function subscribe(onSettingsChange: () => void) {
  window.addEventListener("settings-event", onSettingsChange);

  return () => window.removeEventListener("settings-event", onSettingsChange);
}
