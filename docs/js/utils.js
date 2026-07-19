/**
 * Blends multiple colors based on their percentages.
 * @param {Array} colors - An array of hex color strings to blend.
 * @param {Array} percentages - An array of percentages corresponding to each color.
 * @returns {string} The blended color as a hex string.
 */
export function blendColors(colors, percentages) {
  const blendedColor = colors.reduce(
    (acc, color, index) => {
      const percentage = percentages[index] / 100;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      acc.r += r * percentage;
      acc.g += g * percentage;
      acc.b += b * percentage;

      return acc;
    },
    { r: 0, g: 0, b: 0 }
  );

  // Convert blended RGB values back to a hex color
  const toHex = value => Math.round(value).toString(16).padStart(2, "0");
  return `#${toHex(blendedColor.r)}${toHex(blendedColor.g)}${toHex(
    blendedColor.b
  )}`;
}

/**
 * Formats a number for display: hides zeros, and only shows a decimal
 * when the value isn't a whole number once rounded.
 * @param {number} value
 * @param {number} [decimals] - Max decimals to show when not a whole number.
 * @returns {string} "" for 0, otherwise the rounded value as a string.
 * @description Rounds before checking Number.isInteger so floating-point
 * noise (e.g. 19.999999999999996) doesn't produce a spurious ".0".
 */
export function formatNumber(value, decimals = 1) {
  const rounded = Number(value.toFixed(decimals));
  if (rounded === 0) return "";
  return Number.isInteger(rounded)
    ? rounded.toFixed(0)
    : rounded.toFixed(decimals);
}

/**
 * Rounds a number to a given number of decimals without keeping
 * insignificant trailing zeros (e.g. 20.00 -> 20, 12.50 -> 12.5).
 * @param {number} value
 * @param {number} [decimals]
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  return Number(value.toFixed(decimals));
}

/**
 * Formats a percentage for display, appending "%" unless the value is 0.
 * @param {number} value
 * @returns {string}
 */
export function formatPercentage(value) {
  const formatted = formatNumber(value);
  return formatted === "" ? "" : `${formatted}%`;
}
