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

//constants
let tapCount = 0;
let tapTimeout;
let tapCount1 = 0;
let tapTimeout1;

//triggers easter egg 1 on mobile after 3 clicks
$("#wefarm").on("touchstart", () => {
  tapCount++;
  
  if (tapTimeout) {
    clearTimeout(tapTimeout);
  }

  tapTimeout = setTimeout(() => {
    console.log(tapCount);
    if (tapCount >= 3) {
      $("#video-play").css("display", "block");
      $("#video-play").trigger("play");
      setTimeout(fadeVideo, 2500);
      console.log("triple tap");
    }
    tapCount = 0; // Reset the tap count
  }, 1000); 
});

//triggers easter egg 1 on browser after 3 clicks
$("#wefarm").on("click", (event) => {
  if (event.detail >= 3) {
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

//triggers easter egg 2 on mobile after 2 clicks
$("#trigger").on("touchstart", () => {
  tapCount1++;
  
  if (tapTimeout1) {
    clearTimeout(tapTimeout1);
  }

  tapTimeout1 = setTimeout(() => {
    console.log(tapCount1);
    if (tapCount1 >= 2) {
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
    tapCount1 = 0; // Reset the tap count
  }, 1000); 
});

//triggers easter egg 2 on browser after 2 clicks
$("#trigger").on("click", (event) => {
  if (event.detail >= 2) {
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
