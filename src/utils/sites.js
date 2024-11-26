export function validURL(url) {
  // eslint-disable-next-line no-useless-escape
  return /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i.test(
    url.trim(),
  );
}

export function normalizeURL(url) {
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return `https://${url}`;
}
