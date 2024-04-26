/**
 * Checks the save state of a toggle button
 * from local storage and sets it accordingly
 *
 * @param element The element ID of the toggle button to be checked
 * @param className The class name to toggle
 */
export function isChecked(element, className) {
  let toggle = $(element);
  let storedValue = localStorage.getItem(element);

  // Gets save state of toggle
  toggle.prop("checked", storedValue === "true");

  // On Click change colour mode
  toggle.on("click", () => {
    localStorage.setItem(element, toggle.is(":checked"));
    $("body").toggleClass(className);
    console.log(toggle.is(":checked"));
  });
}

/**
 * Checks the save state of dark mode in local storage and applies it
 */
export function checkDarkMode() {
  if (localStorage.getItem("#dark-mode") === "false") {
    $("body").addClass("light-mode");
  }
}
