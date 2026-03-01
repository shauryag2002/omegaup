/**
 * Simple cookie utility functions to replace vue-cookies plugin.
 * Only supports string values and permanent cookies (no expiry).
 */

export function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)',
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string | boolean): void {
  document.cookie = `${name}=${encodeURIComponent(
    String(value),
  )}; path=/; max-age=31536000`;
}
