/**
 * A wrapper for "JSON.parse()"" to support "undefined" value.
 * Make sure to add a generic <T>
 */
export function parseJSON<T>(value: string | null): T | undefined | null {
  if (value === null) {
    return null;
  } else if (value === "undefined" || typeof value === "undefined") {
    return undefined;
  } else {
    try {
      return JSON.parse(value ?? "");
    } catch (error) {
      console.error(`parsing error on ${value}`);
      return undefined;
    }
  }
}
