import { changePage, scrollTo } from "../../modules/navigations.js";

/* Adds on click to login button */
//TODO update path
changePage("#login", "../../template.html");

/* Adds on click to sign-up button */
//TODO update path
changePage("#sign-up", "../../template.html");

/* Adds click to chevron to scroll to
   the first section */
scrollTo("#chevron", "#first-use-case");

$("#wefarm").on("click", (event) => {
  if (event.detail == 3) {
    $("#video-play").css("display", "block");
    $("#video-play").trigger("play");
    setTimeout(fadeVideo, 2500);
    console.log("triple click");
  }
});

function fadeVideo() {
  $("#video-play").fadeOut(2000);
  $("#group").fadeIn(2000);
}

$("#trigger").on("click", (event) => {
  if (event.detail == 2) {
    $("#water").css("top", "78vh");

    setTimeout(() => {
      $("#water").css("height", "0");
    }, 1000);

    setTimeout(() => {
      $("#water-fill").css("height", "20px");
    }, 1000);

    setTimeout(() => {
      $("#water-fill").css("height", "0");
    }, 2000);

    setTimeout(() => {
      $("#plant-container").css("height", "400px");
    }, 3000);
  }
});
