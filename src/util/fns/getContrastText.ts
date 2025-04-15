export default function getContrastText(color: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  const rgb = result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;

  const brightness = rgb ? Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000) : 0;
  return brightness > 125 ? "black" : "white";
}
