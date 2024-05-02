import { changePage, scrollTo } from "../modules/navigations.js";

/* Adds on click to login button */
//TODO update path
changePage("login", "./template.html");

/* Adds on click to sign-up button */
//TODO update path
changePage("sign-up", "./template.html");

/* Adds click to chevron to scroll to
   the first section */
scrollTo("chevron", "hi");
