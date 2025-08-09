const charLimitCheckbox = document.getElementById("limit");
const charLimitInputbox = document.getElementById("character-limit");
const textToAnalyze = document.querySelector(".main__text");
const filterForm = document.querySelector(".main__filters");

const characterCount = document.querySelector(".result__count--chars");
const wordCount = document.querySelector(".result__count--words");
const sentenceCount = document.querySelector(".result__count--sentences");

const textReadingTime = document.querySelector(".main__reading--time");

charLimitCheckbox.addEventListener("change", function (event) {
  const isChecked = event.target.checked;
  isChecked
    ? charLimitInputbox.removeAttribute("hidden")
    : charLimitInputbox.setAttribute("hidden", "");
});

filterForm.addEventListener("submit", function (e) {
  e.preventDefault();
});

const totalCounts = {
  totalChars: null,
  totalWords: null,
  totalSentences: null,
};

let { totalChars, totalWords, totalSentences } = totalCounts;

function countLetter(str, letter) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === letter) {
      count++;
    }
  }
  return count;
}

const AVG_READING_TIME = 260;

function countReadingTime(words) {
  return words.length / AVG_READING_TIME;
}

textToAnalyze.addEventListener("input", function (e) {
  const value = e.target.value;
  totalChars = value.split("");
  totalWords = value.split(" ").filter((text) => Boolean(text));
  totalSentences = value.split(".").filter((text) => Boolean(text));

  const onlyLetters = value.match(/[a-zA-Z]/g) || [];

  const uniqueChars = [
    ...new Set(
      value
        .toLowerCase()
        .split("")
        .filter((char) => /[a-z]/.test(char)),
    ),
  ];

  const uniqeCharsInfo = uniqueChars
    .map((char) => {
      return {
        character: char,
        count: countLetter(value, char),
        percentage: (
          (countLetter(value, char) / onlyLetters.length) *
          100
        ).toFixed(2),
      };
    })
    .sort((a, b) => b.count - a.count);

  let readingTime = countReadingTime(totalWords);
  textReadingTime.textContent = !Number.isInteger(readingTime)
    ? `<${Math.ceil(readingTime.toFixed(2))}`
    : Math.ceil(readingTime.toFixed(2));
  characterCount.textContent = totalChars.length.toString().padStart("2", "0");
  wordCount.textContent = totalWords.length.toString().padStart("2", "0");
  sentenceCount.textContent = totalSentences.length
    .toString()
    .padStart("2", "0");
});
