export function lowerDirstCapitalLetter(text) {
  if (!text) return '';

  return text.charAt(0).toLowerCase() + text.slice(1);
}
