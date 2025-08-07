const charLimitCheckbox = document.getElementById("limit");
const charLimitInputbox = document.getElementById("character-limit");

const filterForm = document.querySelector(".main__filters");

charLimitCheckbox.addEventListener("change", function (event) {
  const isChecked = event.target.checked;
  isChecked
    ? charLimitInputbox.removeAttribute("hidden")
    : charLimitInputbox.setAttribute("hidden", "");
});

filterForm.addEventListener("submit", function (e) {
  e.preventDefault();
});
