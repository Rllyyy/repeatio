/**
 * Normalizes a link URI by ensuring that it has a consistent format.
 *
 * If the URI already starts with "http://" or "https://", the URI is returned unchanged.
 * Otherwise, "https://" is prepended to the URI.
 *
 * @param uri - The URI to normalize.
 * @returns The normalized URI.
 */
export function normalizeLinkUri(uri: string) {
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  } else {
    return `https://${uri}`;
  }
}
