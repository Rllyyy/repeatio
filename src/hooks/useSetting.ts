import { useSyncExternalStore } from "react";
import { TModuleSortOption } from "../components/Home/ModuleSortButton";
import { parseJSON } from "../utils/parseJSON";

export interface ISettings {
  addedExampleModule?: boolean;
  expanded?: boolean;
  moduleSort?: TModuleSortOption;
  embedYoutubeVideos?: boolean;
}

/**
 * Custom hook for managing settings with localStorage synchronization.
 * @returns A tuple containing the current value and a function to update the value inside the localStorage
 */
export const useSetting = <K extends keyof ISettings>(key: K, defaultValue: Required<NonNullable<ISettings[K]>>) => {
  // Get the current value from the localStorage or use the default value
  const value = useSyncExternalStore(subscribe, () => getSnapShot(key)) ?? defaultValue;

  // Update the value in localStorage and trigger storage event
  const setValue = (newValue: Required<NonNullable<ISettings[K]>>) => {
    // Get the current settings from localStorage
    const localStorageValue = localStorage.getItem("repeatio-settings");

    // Parse the json
    const value = parseJSON<ISettings>(localStorageValue);

    // Update the value in the settings
    const updatedSettings = {
      ...value,
      [key]: newValue,
    };

    // Overwrite the localStorage
    localStorage.setItem("repeatio-settings", JSON.stringify(updatedSettings, null, "\t"));

    // Dispatch StorageEvent to trigger event listeners
    window.dispatchEvent(new StorageEvent("settings-event"));
  };

  return [value, setValue] as const;
};

function subscribe(onSettingsChange: () => void) {
  window.addEventListener("settings-event", onSettingsChange);

  return () => window.removeEventListener("settings-event", onSettingsChange);
}

function getSnapShot<K extends keyof ISettings>(key: K): ISettings[K] {
  // Get the settings from the localStorage
  const localStorageItem = localStorage.getItem("repeatio-settings");

  // Parse json data
  const data = parseJSON<ISettings>(localStorageItem);

  // Return the value for the corresponding key
  return data?.[key];
}
