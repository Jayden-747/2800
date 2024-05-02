import { loadNavbars } from "../modules/navigations.js";
import { checkDarkMode } from "../modules/customizations.js";

// Load the navbars onto the page
$(document).ready(loadNavbars());

// Apply dark mode
checkDarkMode();
