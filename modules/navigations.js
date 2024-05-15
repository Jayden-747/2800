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