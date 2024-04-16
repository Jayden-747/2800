/**
 * Load the navbar onto the page
 */
export function loadNavbars() {
  $("#bottom-navbar-placeholder").load("./html/bottom-navbar.html");
  $("#top-navbar-placeholder").load("./html/top-navbar.html");
}

/**
 * Changes the site to the given file path
 * @param page The file path of the page to go to
 */
export function changePage(page) {
  window.location = page;
}

/**
 * Scrolls the page to the top of a div
 * @param section The div id you want to scroll to
 */
export function scrollTo(section) {
  document.getElementById(section).scrollIntoView({ behavior: "smooth" });
}
