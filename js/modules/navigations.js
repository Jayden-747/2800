/**
 * Load the navbar onto the page
 */
export function loadNavbars() {
  $("#bottom-navbar-placeholder").load("./html/bottom-navbar.html");
  $("#top-navbar-placeholder").load("./html/top-navbar.html");
}

/**
 * Changes the site to the given file path
 * @param buttonID The element ID to add the event listener to
 * @param page The path to the page to change to
 */
export function changePage(buttonID, page) {
  document.getElementById(buttonID).addEventListener("click", () => {
    window.location = page;
  });
}

/**
 * Scrolls the page to the top of a div
 * @param buttonID The element ID to add the event listener to
 * @param section The element ID to scroll to on click
 */
export function scrollTo(buttonID, section) {
  document.getElementById(buttonID).addEventListener("click", () => {
    document.getElementById(section).scrollIntoView({ behavior: "smooth" });
    console.log("click");
  });
}
