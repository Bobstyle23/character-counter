const charLimitCheckbox = document.getElementById("limit");
const charLimitInputbox = document.getElementById("character-limit");
const textToAnalyze = document.querySelector(".main__text");
const filterForm = document.querySelector(".main__filters");

const characterCount = document.querySelector(".result__count--chars");
const wordCount = document.querySelector(".result__count--words");
const sentenceCount = document.querySelector(".result__count--sentences");

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

textToAnalyze.addEventListener("input", function (e) {
  const value = e.target.value;
  let { totalChars, totalWords, totalSentences } = totalCounts;
  totalChars = value.split("");
  totalWords = value.split(" ").filter((text) => Boolean(text));
  totalSentences = value.split(".").filter((text) => Boolean(text));

  characterCount.textContent = totalChars.length.toString().padStart("2", "0");
  wordCount.textContent = totalWords.length.toString().padStart("2", "0");
  sentenceCount.textContent = totalSentences.length
    .toString()
    .padStart("2", "0");
});
