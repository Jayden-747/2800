/**
 * Changes the site to the given file path
 * @param buttonID The element ID to add the event listener to
 * @param page The path to the page to change to
 */
export function changePage(buttonID, page) {
  $(buttonID).on("click", () => {
    window.location = page;
  });
}

/**
 * Scrolls the page to the top of a div
 * @param buttonID The element ID to add the event listener to
 * @param section The element ID to scroll to on click
 */
export function scrollTo(buttonID, section) {
  $(buttonID).on("click", () => {
    $("html, body").animate(
      {
        scrollTop: $(section).offset().top,
      },
      500
    );
    console.log("click");
  });
}

<<<<<<< HEAD
// export function image() {
//   var urlData;
// document.querySelector("#photo").addEventListener("change", function () { 
//     const reader = new FileReader();

//     reader.addEventListener("load", () => { 
//         console.log(reader.result);
//         urlData = reader.result;
        
        
//     });
 
//         reader.readAsDataURL(this.files[0]);


    

//   });

// }
=======
/**
 * Opens the hamburger menu upon clicking the hamburger icon on the bottom navbar
 */
export function openHamburger() {
  $("#hamburger-button").on("click", () => {
    $("#hamburger").css({
      width: "50%",
      boxShadow: "0 0 0 max(100vh, 100vw) #000000af",
    });
    $("#bottom-navbar").css({ right: "50%" });
    $("#top-navbar").css({ right: "50%" });
  });
}

/**
 * Closes the hamburger menu upon clicking the close button in the hamburger menu
 */
export function closeHamburger() {
  $("#hamburger-close").on("click", () => {
    $("#hamburger").css({ width: "0", boxShadow: "none" });
    $("#bottom-navbar").css({ right: "0" });
    $("#top-navbar").css({ right: "0" });
  });
}
>>>>>>> 05edecce454b94e482ade6d7ea933f5ea795e576
