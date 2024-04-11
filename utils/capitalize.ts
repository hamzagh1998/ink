export function capitalize(string: string) {
  if (string) {
    let word = "";
    let words = string.split(" ");

    words = words.map((word) =>
      word != "" ? word[0].toUpperCase() + word.slice(1) : ""
    );
    for (const w of words) word += w + " ";
    return word.trim();
  }
}
