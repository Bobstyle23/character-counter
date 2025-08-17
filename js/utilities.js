const AVG_READING_TIME = 200;

function countLetter(str, letter) {
  return str.split("").reduce((acc, curr) => {
    if (curr.toLowerCase() === letter) {
      acc++;
    }
    return acc;
  }, 0);
}

function countReadingTime(words) {
  return words.length / AVG_READING_TIME;
}

function switchMode() {
  if (document.documentElement.dataset.theme === "light") {
    document.documentElement.dataset.theme = "dark";
    return;
  }
  document.documentElement.dataset.theme = "light";
}

export { countLetter, countReadingTime, switchMode };
