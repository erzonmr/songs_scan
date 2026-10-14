const root =
  "(?:[A-G](?:#|b)?)(?:m|maj|min|dim|aug|sus|add)?\\d*(?:\\([^)]*\\))?(?:\\/[A-G](?:#|b)?)?";
const chord = new RegExp("^" + root + "$", "i");
export function removeObviousChordLines(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      const tokens = trimmed.split(/\s+/).map((t) => t.replace(/^\[|\]$/g, ""));
      return !(tokens.length <= 12 && tokens.every((t) => chord.test(t)));
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
