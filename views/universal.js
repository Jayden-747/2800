import { checkDarkMode } from "../modules/customizations.js";
import { openHamburger, closeHamburger } from "../modules/navigations.js";

// Apply dark mode
checkDarkMode();

// Opens hamburger when hamburger menu button clicked
openHamburger();

// Closes hamburger when x is clicked in hamburger menu
closeHamburger();

// Closes Hamburger menus when clicked outside of it
$(document).on("mousedown", (event) => {
  if (!document.querySelector("#hamburger").contains(event.target)) {
    $("#hamburger").css({ width: "0", boxShadow: "none" });
    $("#bottom-navbar").css({ right: "0" });
    $("#top-navbar").css({ right: "0" });
  }
});
