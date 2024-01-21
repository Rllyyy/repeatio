import { PropsWithChildren, useSyncExternalStore } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { settingsSchema } from "@hooks/useSetting";

type TooltipProps = {
  id: string;
  tooltipText: string;
  childClassName?: string;
  tooltipClassName?: string;
  tooltipPlace?: "top" | "bottom" | "left" | "right";
};

export function ComponentWithTooltip({
  id,
  children,
  childClassName,
  tooltipClassName,
  tooltipText,
  tooltipPlace = "top",
}: PropsWithChildren<TooltipProps>) {
  const showTooltip = useTooltip();

  return (
    <>
      {/* cypress has issues with tailwind-merge, so sadly cant use cn */}
      <div className={childClassName || "flex items-center"} id={id}>
        {children}
      </div>
      {showTooltip && (
        <ReactTooltip
          anchorSelect={`#${id}`}
          place={tooltipPlace}
          className={tooltipClassName || "leading-5"}
          noArrow
          delayShow={200}
        >
          {tooltipText}
        </ReactTooltip>
      )}
    </>
  );
}

const useTooltip = () => {
  // Get the settings as a string from localStorage
  const value = useSyncExternalStore(subscribe, getSnapShot) ?? "{}";

  try {
    // Try to parse the value as JSON and validate it with the settings schema.
    const parsedSettings = settingsSchema.safeParse(JSON.parse(value));

    // If the parsing and validation were successful, return the parsed data.
    // Otherwise, default to true.
    return parsedSettings.success ? parsedSettings.data.showTooltips : true;
  } catch (error) {
    // If an error occurred while parsing the JSON or validating the data,
    // log the error and default to true.
    console.error("Failed to parse settings:", error);
    return true;
  }
};

function subscribe(onSettingsChange: () => void) {
  window.addEventListener("settings-event", onSettingsChange);

  return () => window.removeEventListener("settings-event", onSettingsChange);
}

function getSnapShot() {
  // Get the settings from the localStorage
  return localStorage.getItem("repeatio-settings");
}
