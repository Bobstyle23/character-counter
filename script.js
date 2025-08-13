const themeSwitchBtn = document.querySelector(".navigation__switch");
const filterForm = document.querySelector(".main__filters");

const removeSpacesCheckbox = document.getElementById("space");
const charLimitCheckbox = document.getElementById("limit");
const charLimitInputbox = document.getElementById("character-limit");
const textToAnalyze = document.querySelector(".main__text");

const characterCount = document.querySelector(".result__count--chars");
const wordCount = document.querySelector(".result__count--words");
const sentenceCount = document.querySelector(".result__count--sentences");

const textReadingTime = document.querySelector(".main__reading--time");
const progressBarsContainer = document.querySelector(".progress");
const seeMoreBtn = document.querySelector(".see-more");
const noTextInfo = document.querySelector(".no-characters");
const chevronIcons = document.querySelectorAll('[aria-label="Chevron icon"]');

const errorBox = document.querySelector(".error__box");
const errorLimitNumber = document.querySelector(".error__limit-number");

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.dataset.theme = "dark";
} else {
  document.documentElement.dataset.theme = "light";
}

window
  .matchMedia("((prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    document.documentElement.dataset.theme = event.matches ? "dark" : "light";
  });

themeSwitchBtn.addEventListener("click", () => {
  if (document.documentElement.dataset.theme === "light") {
    document.documentElement.dataset.theme = "dark";
    return;
  }
  document.documentElement.dataset.theme = "light";
});

const totalCounts = {
  totalChars: null,
  totalWords: null,
  totalSentences: null,
};

const AVG_READING_TIME = 260;

filterForm.addEventListener("submit", function (e) {
  e.preventDefault();
});

charLimitCheckbox.addEventListener("change", function (event) {
  const isChecked = event.target.checked;
  isChecked
    ? charLimitInputbox.removeAttribute("hidden")
    : charLimitInputbox.setAttribute("hidden", "");
});

let { totalChars, totalWords, totalSentences } = totalCounts;

function countLetter(str, letter) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.toLowerCase()[i] === letter) {
      count++;
    }
  }
  return count;
}

function countReadingTime(words) {
  return words.length / AVG_READING_TIME;
}

textToAnalyze.addEventListener("input", function (e) {
  const value = e.target.value;
  const onlyLetters = value.match(/[a-zA-Z]/g) || [];

  totalChars = value.split("");
  totalWords = value.split(" ").filter((text) => Boolean(text));
  totalSentences = value.split(".").filter((text) => Boolean(text));

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

  const [topFiveLetters, ...otherLetters] = [
    uniqeCharsInfo.slice(0, 5),
    ...uniqeCharsInfo.slice(5),
  ];

  progressBarsContainer.toggleAttribute("hidden", !uniqeCharsInfo.length);

  const progressResults = uniqeCharsInfo.map((info) => {
    return `
        <p>${info.character.toUpperCase()}</p>
        <progress class="progress-bar" value=${info.percentage} max="100">${info.percentage}</progress>
        <p class="count">${info.count}<span>(${info.percentage}%)</span></p>
        `;
  });

  progressBarsContainer.innerHTML = progressResults.join("");

  let readingTime = countReadingTime(totalWords);
  textReadingTime.textContent = !Number.isInteger(readingTime)
    ? `<${Math.ceil(readingTime.toFixed(2))}`
    : Math.ceil(readingTime.toFixed(2));

  removeSpacesCheckbox.addEventListener("change", (event) => {
    const isChecked = event.target.checked;
    isChecked
      ? (characterCount.textContent = value
          .replaceAll(" ", "")
          .length.toString()
          .padStart(2, "0"))
      : (characterCount.textContent = totalChars.length
          .toString()
          .padStart("2", "0"));
  });

  characterCount.textContent = totalChars.length.toString().padStart("2", "0");
  wordCount.textContent = totalWords.length.toString().padStart("2", "0");
  sentenceCount.textContent = totalSentences.length
    .toString()
    .padStart("2", "0");

  seeMoreBtn.toggleAttribute("hidden", uniqeCharsInfo.length < 5);
  noTextInfo.toggleAttribute("hidden", uniqeCharsInfo.length);
});

seeMoreBtn.addEventListener("click", function () {
  if (seeMoreBtn.textContent.includes("See more")) {
    seeMoreBtn.firstChild.textContent = "See less ";
  } else {
    seeMoreBtn.firstChild.textContent = "See more ";
  }

  [...chevronIcons].forEach(function (icon) {
    icon.toggleAttribute("hidden", !icon.hasAttribute("hidden"));
  });
});
