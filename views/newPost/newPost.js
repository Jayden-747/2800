$("#photo").on("change", (element) => {
  let photo = URL.createObjectURL(element.target.files[0]);
  $("#post-photo").css("display", "inline-block").attr("src", photo);
});

//input validation for submitting a most, making sure a photo is uploaded
$(document).ready(function() {
  $('#form1').on('submit', function(event) {
      var photoInput = $('#photo');
      if (photoInput[0].files.length === 0) {
          alert('Please upload a photo before submitting.'); 
          event.preventDefault(); // Prevent the form from submitting
      }
  });
});