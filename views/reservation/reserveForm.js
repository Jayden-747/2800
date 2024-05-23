function validDates() {
    let startDateValue = document.getElementById('reservationStartDate').value;
    let endDateValue = document.getElementById('reservationEndDate').value;
    console.log('startDateValue: ' + startDateValue);
    console.log('endDateValue: ' + endDateValue);

    // * NOTE: using Date constructor converts to ONE DAY BEHIND
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);
    console.log('startDate: ' + startDate);
    console.log('endDate: ' + endDate);


    // If dates are equal
    if (startDate.getTime() === endDate.getTime()) {
        alert("Error: Dates selected are the same!");

    } else if (startDate.getTime() > endDate.getTime()) {
        // **** SETS 'START-DATE' TO 1 DAY BEFORE 'END-DATE' ****
        // Initialize newStartDate as a Date object
        const newStartDate = new Date(startDate);
        // Set newStartDate to day before end date
        // ! WORKAROUND: I dont need subtract a day because Date constructor changes the original date to the day before 
        newStartDate.setDate(endDate.getDate());

        // ** FORMATS START DATE TO YYYY-MM-DD (chatGPT) **
        const year = newStartDate.getFullYear();
        // Get 0-based month, convert to 1-based month, convert to String then pad with 0's if needed 
        const month = String(newStartDate.getMonth() + 1).padStart(2, '0');
        // Get day of month, pad with 0's if needed
        const day = String(newStartDate.getDate()).padStart(2, '0');
        const formattedStartDate = `${year}-${month}-${day}`;

        // Replaces start date input to new start date (1 day prior end date)
        document.getElementById('reservationStartDate').value = formattedStartDate;
        alert('Error: Start date cannot be set after end date!');

    } else if (endDate.getTime() > startDate.getTime()) {
        // **** SETS 'END-DATE' TO 1 DAY AFTER 'START-DATE' ****
        // Initialize newEndDate as a Date object
        const endStartDate = new Date(endDate);
        // Set endStartDate to day after start date
        // ! WORKAROUND: I add TWO DAYS because Date constructor changes the original date to the day before 
        endStartDate.setDate(startDate.getDate() + 2);

        // ** FORMATS END DATE TO YYYY-MM-DD (chatGPT) **
        const year = endStartDate.getFullYear();
        // Get 0-based month, convert to 1-based month, convert to String then pad with 0's if needed 
        const month = String(endStartDate.getMonth() + 1).padStart(2, '0');
        // Get day of month, pad with 0's if needed
        const day = String(endStartDate.getDate()).padStart(2, '0');
        const formattedEndDate = `${year}-${month}-${day}`;

        // Replaces end date input to new end date (1 day after start date)
        document.getElementById('reservationStartDate').value = formattedEndDate;
        alert('Error: End date cannot be set before start date!');
    }
}

// TODO: when i select start date FIRST then select end date as any day prior, the start date changes to the last day of the month 


$(document).ready(function(){
    $('.modal-body').html(``);

});
