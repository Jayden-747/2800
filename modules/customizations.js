/**
 * Checks the save state of a toggle button
 * from local storage and sets it accordingly
 *
 * @param element The element of the toggle button to be checked
 * @param className The class name to toggle
 */
export function isChecked(element, className) {
  let toggle = document.getElementById(element);
  let storedValue = localStorage.getItem(element);

  // Gets save state of toggle
  toggle.checked = storedValue === "true";

  // On Click change colour mode
  toggle.addEventListener("click", () => {
    localStorage.setItem(element, toggle.checked);
    document.body.classList.toggle(className);
  });
}

/**
 * Checks the save state of dark mode in local storage and applies it
 */
export function checkDarkMode() {
  if (localStorage.getItem("dark-mode") == "false") {
    document.body.classList.toggle("light-mode");
  }
}
