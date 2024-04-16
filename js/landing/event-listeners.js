import { changePage, scrollTo } from "../modules/navigations.js";

/* Adds on click to login button */
//TODO update path
$("#login").click(() => {
  changePage("./template.html");
});

/* Adds on click to sign-up button */
//TODO update path
$("#sign-up").click(() => {
  changePage("./template.html");
});

/* Adds click to chevron to scroll to
   the first section */
//TODO Change name when section added
$("#chevron").click(() => {
  scrollTo("section");
});
