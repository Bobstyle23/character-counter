const modeSwitchBtn = document.querySelector(".navigation__btn");
const textArea = document.querySelector(".main__text");
const filterForm = document.querySelector(".main__filters");

const excludeSpacesCheckbox = document.getElementById("space");
const noSpaceIndicatorText = document.querySelector(".result__count--no-space");
const limitCheckbox = document.getElementById("limit");
const limitInputbox = document.getElementById("character-limit");

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

import { countLetter, countReadingTime, switchMode } from "./utilities.js";

//PERF: Mode auto-switch function
(function () {
  if (window.matchMedia("(prefers-color-scheme:dark)").matches) {
    document.documentElement.dataset.theme = "dark";
  } else {
    document.documentElement.dataset.theme = "light";
  }

  window
    .matchMedia("(prefers-color-scheme:dark)")
    .addEventListener("change", (event) => {
      document.documentElement.dataset.theme = event.matches ? "dark" : "light";
    });
})();

modeSwitchBtn.addEventListener("click", switchMode);

filterForm.addEventListener("submit", function (e) {
  e.preventDefault();
});

let limitValue = 0;

let isExcludeSpaceChecked = false;
let isLimitExceeded = false;
let totalChars, totalWords, totalSentences;

function toggleErrorClass(isError) {
  textArea.classList.toggle("error", isError);
  errorBox.toggleAttribute("hidden", !isError);
  errorLimitNumber.textContent = limitValue;
}

function checkError() {
  const value = textArea.value;
  const isError =
    limitCheckbox.checked && value.length > limitValue && Boolean(limitValue);

  isLimitExceeded = isError;
  //NOTE: Invokes updateCounts() if limit exceeded
  updateCounts();
  toggleErrorClass(isError);
}

function updateReadingTime(words) {
  let readingTime = countReadingTime(words);

  //NOTE: If limit exceeded set to 0 else count reading time
  textReadingTime.textContent = isLimitExceeded
    ? "0"
    : !Number.isInteger(readingTime)
      ? `<${Math.ceil(readingTime.toFixed(2))}`
      : Math.ceil(readingTime.toFixed(2));
}

function updateCounts() {
  const value = textArea.value;
  totalWords = value.split(" ").filter(Boolean);
  totalSentences = value.split(".").filter(Boolean);

  totalChars = isExcludeSpaceChecked
    ? value.replaceAll(" ", "")
    : value.split("");

  updateReadingTime(totalWords);

  const totals = [totalChars, totalWords, totalSentences];
  [characterCount, wordCount, sentenceCount].forEach((count, idx) => {
    count.textContent = isLimitExceeded
      ? "00"
      : totals[idx].length.toString().padStart(2, "0");
  });
}

limitInputbox.addEventListener("input", (event) => {
  limitValue = Number(event.target.value);
  checkError();
  //NOTE: Updates counts on limit value change
  updateCounts();
});

limitCheckbox.addEventListener("change", (event) => {
  const isChecked = event.target.checked;
  const isError =
    limitCheckbox.checked &&
    textArea.value.length > limitValue &&
    Boolean(limitValue);
  limitInputbox.toggleAttribute("hidden", !isChecked);
  limitInputbox.value = "";
  limitValue = 0;
  isLimitExceeded = isChecked && isError;
  updateCounts();
  toggleErrorClass(isError);
});

excludeSpacesCheckbox.addEventListener("change", (event) => {
  isExcludeSpaceChecked = event.target.checked;
  noSpaceIndicatorText.toggleAttribute("hidden", !event.target.checked);
  //NOTE: Calls updateCounts() on exclue space checkbox checked
  updateCounts();
});

textArea.addEventListener("input", function (e) {
  checkError();
  //NOTE: Initial invoke & updating counts
  updateCounts();

  const value = e.target.value;
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

  const [topFiveLetters, ...otherLetters] = [
    uniqeCharsInfo.slice(0, 5),
    ...uniqeCharsInfo.slice(5),
  ];

  progressBarsContainer.toggleAttribute("hidden", !uniqeCharsInfo.length);

  const progressResults = uniqeCharsInfo.map((info) => {
    return `
        <p>${info.character.toUpperCase()}</p>
        <progress class="progress-bar" value=${info.percentage} max="100">${info.percentage}</progress>
        <p class="count">${info.count} <span>(${info.percentage}%)</span></p>
        `;
  });

  progressBarsContainer.innerHTML = progressResults.join("");

  //NOTE: Updates readingTime
  updateReadingTime(totalWords);

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
