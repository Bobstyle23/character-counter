const _AVG_READING_TIME = new WeakMap();

class CharacterCounter {
  constructor() {
    _AVG_READING_TIME.set(this, 200);
    this.cacheDOM();
    this.initState();
    this.bindEvents();
  }

  static {
    if (window.matchMedia("(prefers-color-scheme:dark)").matches) {
      document.documentElement.dataset.theme = "dark";
    } else {
      document.documentElement.dataset.theme = "light";
    }

    window
      .matchMedia("(prefers-color-scheme:dark)")
      .addEventListener("change", (event) => {
        document.documentElement.dataset.theme = event.matches
          ? "dark"
          : "light";
      });
  }

  static #countLetter(str, letter) {
    return str.split("").reduce((acc, curr) => {
      if (curr.toLowerCase() === letter) {
        acc++;
      }
      return acc;
    }, 0);
  }

  static #countReadingTime(words, instance) {
    return words.length / _AVG_READING_TIME.get(instance);
  }

  static #switchMode() {
    if (document.documentElement.dataset.theme === "light") {
      document.documentElement.dataset.theme = "dark";
      return;
    }
    document.documentElement.dataset.theme = "light";
  }

  cacheDOM() {
    this.modeSwitchBtn = document.querySelector(".navigation__btn");
    this.textArea = document.querySelector(".main__text");
    this.filterForm = document.querySelector(".main__filters");

    this.excludeSpacesCheckbox = document.getElementById("space");
    this.noSpaceIndicatorText = document.querySelector(
      ".result__count--no-space",
    );
    this.limitCheckbox = document.getElementById("limit");
    this.limitInputbox = document.getElementById("character-limit");

    this.characterCount = document.querySelector(".result__count--chars");
    this.wordCount = document.querySelector(".result__count--words");
    this.sentenceCount = document.querySelector(".result__count--sentences");

    this.textReadingTime = document.querySelector(".main__reading--time");
    this.progressBarsContainer = document.querySelector(".progress");
    this.seeMoreBtn = document.querySelector(".see-more");
    this.noTextInfo = document.querySelector(".no-characters");
    this.chevronIcons = document.querySelectorAll(
      '[aria-label="Chevron icon"]',
    );

    this.errorBox = document.querySelector(".error__box");
    this.errorLimitNumber = document.querySelector(".error__limit-number");
  }

  initState() {
    this.limitValue = 0;
    this.isExcludeSpaceChecked = false;
    this.totalChars = [];
    this.totalWords = [];
    this.totalSentence = [];
    this.isExpanded = false;

    this.value = this.textArea.value;
  }

  bindEvents() {
    this.limitInputbox.addEventListener("input", (e) => {
      this.limitValue = Number(e.target.value);
      this.checkError();
      this.#updateCounts();
      this.#updateProgressBars();
    });

    this.limitCheckbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      const isError =
        this.limitCheckbox.checked &&
        (this.totalChars?.length || this.value.length) > this.limitValue &&
        Boolean(this.limitValue);

      this.limitInputbox.toggleAttribute("hidden", !isChecked);
      this.limitInputbox.value = "";
      this.limitValue = 0;
      this.isLimitExceeded = isChecked && isError;
      this.#updateCounts();
      this.#updateProgressBars();
      this.#toggleErrorClass(isError);
    });

    this.excludeSpacesCheckbox.addEventListener("change", (e) => {
      this.isExcludeSpaceChecked = e.target.checked;
      this.noSpaceIndicatorText.toggleAttribute("hidden", !e.target.checked);
      this.refreshUI();
    });

    this.textArea.addEventListener("input", (e) => {
      this.value = e.target.value;
      this.refreshUI();
      this.updateReadingTime(this.totalWords);
    });

    this.seeMoreBtn.addEventListener("click", () => {
      [...this.chevronIcons].forEach((icon) => {
        icon.toggleAttribute("hidden", !icon.hasAttribute("hidden"));
      });
      this.isExpanded = !this.isExpanded;
      this.#updateProgressBars();
    });

    this.modeSwitchBtn.addEventListener("click", CharacterCounter.#switchMode);
    this.filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  refreshUI() {
    this.#updateCounts();
    this.checkError();
    this.#updateProgressBars();
  }

  #toggleErrorClass(isError) {
    this.textArea.classList.toggle("error", isError);
    this.errorBox.toggleAttribute("hidden", !isError);
    this.errorLimitNumber.textContent = this.limitValue;
  }

  checkError() {
    if (!this.limitCheckbox.checked || this.limitValue <= 0) {
      this.isLimitExceeded = false;
      this.#toggleErrorClass(false);
      return;
    }
    const lengthToCheck = this.totalChars?.length ?? this.value.length;
    const isError = lengthToCheck > this.limitValue;

    this.isLimitExceeded = isError;
    this.#updateCounts();
    this.#toggleErrorClass(isError);
  }

  updateReadingTime(words) {
    const readingTime = CharacterCounter.#countReadingTime(words, this);
    this.textReadingTime.textContent = this.isLimitExceeded
      ? "0"
      : !Number.isInteger(readingTime)
        ? `<${Math.ceil(readingTime.toFixed(2))}`
        : Math.ceil(readingTime.toFixed(2));
  }

  #updateCounts() {
    this.totalWords = this.value.split(" ").filter(Boolean);
    this.totalSentences = this.value.split(".").filter(Boolean);
    this.totalChars = this.isExcludeSpaceChecked
      ? this.value.replaceAll(" ", "")
      : this.value.split("");

    this.updateReadingTime(this.totalWords);

    const totals = [this.totalChars, this.totalWords, this.totalSentences];
    [this.characterCount, this.wordCount, this.sentenceCount].forEach(
      (count, idx) => {
        count.textContent = this.isLimitExceeded
          ? "00"
          : totals[idx].length.toString().padStart(2, "0");
      },
    );
  }

  #updateProgressBars() {
    const onlyLetters = this.value.match(/[a-zA-Z]/g) || [];

    const uniqueCharacters = [
      ...new Set(
        this.value
          .toLowerCase()
          .split("")
          .filter((char) => /[a-z]/.test(char)),
      ),
    ];

    const progressValues = uniqueCharacters
      .map((char) => {
        const count = CharacterCounter.#countLetter(this.value, char);
        return {
          character: char,
          count,
          percentage: ((count / onlyLetters.length) * 100).toFixed(2),
        };
      })
      .sort((a, b) => b.count - a.count);

    const [topLetters, otherLetters] = [
      progressValues.slice(0, 5),
      progressValues.slice(5),
    ];

    const lettersToShow = this.isExpanded
      ? [...topLetters, ...otherLetters]
      : topLetters;

    this.progressBarsContainer.toggleAttribute(
      "hidden",
      !progressValues.length,
    );

    const progressResults = lettersToShow.map((progress) => {
      return `
        <p>${progress.character.toUpperCase()}</p>
        <progress class="progress-bar" value=${progress.percentage} max="100">${progress.percentage}</progress>
        <p class="count">${progress.count} <span>(${progress.percentage}%)</span></p>
        `;
    });

    this.progressBarsContainer.innerHTML = this.isLimitExceeded
      ? `<small class="error__text">Limit reached! Adjust your text to see your results.</small>`
      : progressResults.join("");

    this.seeMoreBtn.toggleAttribute(
      "hidden",
      progressValues.length < 5 || this.isLimitExceeded,
    );

    this.seeMoreBtn.firstChild.textContent = this.isExpanded
      ? "See less"
      : "See more";

    this.noTextInfo.toggleAttribute("hidden", progressValues.length);
  }
}

new CharacterCounter();
