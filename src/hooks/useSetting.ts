import { useSyncExternalStore } from "react";
import { moduleSortOptions } from "../components/Home/ModuleSortButton";
import { parseJSON } from "../utils/parseJSON";
import { z } from "zod";

export const settingsSchema = z.object({
  addedExampleModule: z.boolean().optional(),
  expanded: z.boolean().optional(),
  moduleSort: z.enum(moduleSortOptions).optional(),
  embedYoutubeVideos: z.boolean().optional(),
  showTooltips: z.boolean().optional(),
});

export const defaultSettings: Required<TSettings> = {
  addedExampleModule: false,
  expanded: true,
  moduleSort: "Name (ascending)",
  embedYoutubeVideos: false,
  showTooltips: true,
} as const;

export type TSettings = z.infer<typeof settingsSchema>;

/**
 * Custom hook for managing settings with localStorage synchronization.
 * @returns A tuple containing the current value and a function to update the value inside the localStorage
 */
export const useSetting = <K extends keyof TSettings>(key: K) => {
  // Get the current value from the localStorage or use the default value
  const value = useSyncExternalStore(subscribe, () => getSnapShot(key)) ?? defaultSettings[key];

  // Update the value in localStorage and trigger storage event
  const setValue = (newValue: Required<NonNullable<TSettings[K]>>) => {
    // Get the current settings from localStorage
    const localStorageValue = localStorage.getItem("repeatio-settings");

    // Parse the json
    const value = parseJSON<TSettings>(localStorageValue);

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

function getSnapShot<K extends keyof TSettings>(key: K): TSettings[K] {
  // Get the settings from the localStorage
  const localStorageItem = localStorage.getItem("repeatio-settings");

  // Parse json data
  const data = parseJSON<TSettings>(localStorageItem);

  // Return the value for the corresponding key
  return data?.[key];
}
