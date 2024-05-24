$("#photo").on("change", (element) => {
  let photo = URL.createObjectURL(element.target.files[0]);
  $("#post-photo").css("display", "inline-block").attr("src", photo);
});
