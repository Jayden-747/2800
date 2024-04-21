import { loadNavbars } from "../../modules/navigations.js";

$(document).ready(loadNavbars());

$("#nav1").click(() => {
  console.log("hi");
});
