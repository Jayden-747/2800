
/**
 * validDates() warns the user if they inputted invalid dates: Error if user selects the same start and end dates. Error if start date is after end date, then automatically sets the start date 1 day prior to end date.
 */
function validDates() {
    let startDateValue = document.getElementById('reservationStartDate').value;
    let endDateValue = document.getElementById('reservationEndDate').value;
    console.log('!!!!!!!!startDateValue: ' + startDateValue);
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
        // **** SETS 'START-DATE' ONE DAY PRIOR TO 'END-DATE' ****
        // Initialize newStartDate as a Date object
        const newStartDate = new Date(endDate);
        // Set newStartDate to day before end date
        // ! WORKAROUND: I dont need subtract a day because Date constructor changes the original date to the day before 
        // newStartDate.setDate(endDate.getDate());

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

    }     
}

// ! when i select start date FIRST then select end date as first of the month, the start date changes to the last day of the month 

// Function for conformation modal and submitting a form
$(document).ready(function() {

    console.log("why not working?");

    $('#positive').on('click', function() {
        console.log('is this function working?');
        $('#reservationFormId').submit();
    });
});
