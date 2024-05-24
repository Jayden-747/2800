

function comment(userArray, commentsArray) {
    console.log("hello")

    const setup = async () => {
        $('.modal-body').empty();
        let user = JSON.parse(userArray)
        let comments = JSON.parse(commentsArray)
        console.log(JSON.parse(userArray))
        for (let i = 0; i < user.length; i++){

        
        $('#viewC').append(`
        
        
        <h3>${user[i]} 
        <br>
        <br>
        ${comments[i]}</h3>
        <br>
        <h3>Comments!</h3>
        <br>
        `)

        }

    }


    $(document).ready(setup);


}



function alert () {

    Swal.fire({
    title: "Post Submitted!",
    text: "Thank You!", 
    icon: "success",
    showConfirmButton: false
    }
  ) 
    

}



