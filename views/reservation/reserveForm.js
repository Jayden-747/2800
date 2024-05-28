/**
 * min is the minimum amount of days a user can reserve the plot for
 */
const min = 21;

/**
 * max is the maxiumum amount of days a user can reserve the plot for
 */
const max = 365;

// Today's date
const today = new Date();
console.log('📌Actually today: ' + today);
// Subtract one day from today's date
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

// ! Format yesterday's date as YYYY-MM-DD ... BUT IT PRINTS OUT AS TODAY'S DATE IDK WHY
const yesterdayFormatted = yesterday.toISOString().split('T')[0];

console.log('📍Today (but as an object it was yesterday): ' + yesterdayFormatted);

// Greys out current day and prior days on the calendar: Earliest date to choose is 'tomorrow'
$(document).ready(function () {

  const startInput = $('#reservationStartDate');
  startInput.attr('min', yesterdayFormatted);

  const endInput = $('#reservationEndDate');
  endInput.attr('min', yesterdayFormatted);
})


/**
 * resetDates resets the dates to be 21 days apart (minimum reservation period)
 * @param {*} start is a Date object representing the the start date entered
 * @param {*} end is a Date object representing the end date entered
 */
function resetDates(start, end) {

  console.log("inside resetDates");
  //// console.log('in resetdates, start: ' + start);
  // Initialize newStartDate as a Date object
  let newEndDate = new Date(start);
  //// console.log("newEndDate value: " + newEndDate);
  // Set newStartDate to day before end date
  newEndDate.setDate(newEndDate.getDate() + min);
  //// console.log('in resetdates, newEndDate after adding minimum: ' + newEndDate);

  // ** FORMATS START DATE TO YYYY-MM-DD (chatGPT) **
  const startYear = start.getFullYear();
  // Get 0-based month, convert to 1-based month, convert to String then pad with 0's if needed 
  const startMonth = String(start.getMonth() + 1).padStart(2, '0');
  // Get day of month, pad with 0's if needed
  const startDay = String(start.getDate()).padStart(2, '0');
  const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;

  // ** FORMATS END DATE TO YYYY-MM-DD (chatGPT) **
  const year = newEndDate.getFullYear();
  // Get 0-based month, convert to 1-based month, convert to String then pad with 0's if needed 
  const month = String(newEndDate.getMonth() + 1).padStart(2, '0');
  // Get day of month, pad with 0's if needed
  const day = String(newEndDate.getDate()).padStart(2, '0');
  const formattedEndDate = `${year}-${month}-${day}`;

  // Replaces start date input to new start date (1 day prior end date)
  document.getElementById('reservationStartDate').value = formattedStartDate;
  document.getElementById('reservationEndDate').value = formattedEndDate;
  displayTotal(newEndDate, start);
  //// console.log('in resetdates, formattedEndDate: ' + formattedEndDate);
};

/**
 * calculateTotal calculates the days from start to end dates
 * @param {*} end is a Date object representing the end date
 * @param {*} start is a Date object representing the start date
 */
function calculateTotal(end, start) {
  let length = end - start;
  let convertedLength = length / (1000 * 60 * 60 * 24);
  console.log("LENGTH: " + length);
  return convertedLength;

};

/**
 * displayTotal displays the total 
 * @param {*} end is a Date object representing the end date
 * @param {*} start is a Date object representing the start date
 */
function displayTotal(end, start) {
  console.log("inside displayTotal");
  const total = calculateTotal(end, start);
  // Only display length if 1 day or greater
  if (total > 0) {
    document.getElementById('reservationTotal').innerHTML = total + " days ! 🌱";
  };
  // };
};

/**
 * displayError displays error message.
 */
function displayError(msg) {
  $('#error-messages').html(`<div class="error">${msg}</div>`);
  $('#error-messages').addClass('error');
}

/**
 * validDates() warns the user if they inputted invalid dates: Error if user selects the same start and end dates. Error if start date is after end date, then automatically sets the start date 1 day prior to end date.
 */
function validDates() {
  console.log("inside validDates");

  // Clear error messages if any
  displayError("");

  let startDateValue = document.getElementById('reservationStartDate').value;
  let endDateValue = document.getElementById('reservationEndDate').value;
  console.log('!!!!!!!!startDateValue: ' + startDateValue);
  console.log('endDateValue: ' + endDateValue);

  // * NOTE: using Date constructor converts to ONE DAY BEHIND
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
  console.log('startDate: ' + startDate);
  console.log('endDate: ' + endDate);

  if ((calculateTotal(endDate, startDate) < min) && calculateTotal(endDate, startDate) > 0) {
    // alert("Minimum 21 days to reserve a plot!");
    displayError(`Minimum ${min} days to reserve a plot!`);
    resetDates(startDate, endDate);

  } else if (startDate.getTime() === endDate.getTime()) {
    resetDates(startDate, endDate);
    displayError(`Dates selected are the same!`);
    // alert("Error: Dates selected are the same!");

  } else if (startDate.getTime() > endDate.getTime()) {

    resetDates(startDate, endDate);
    displayError(`Start date must be before end date!`)
    // alert('Error: Start date cannot be set after end date!');

  } else {
    displayTotal(endDate, startDate);
  }
}


// ! when i select start date FIRST then select end date as first of the month, the start date changes to the last day of the month 

// Function for conformation modal and submitting a form
$(document).ready(function () {

  console.log("why not working?");

  $('#positive').on('click', function (event) {
    console.log('is this function working?');
    let startInput = document.getElementById('reservationStartDate').value;
    let endInput = document.getElementById('reservationEndDate').value;
    if (!startInput || !endInput) {
      alert('All fields are required.');
      event.preventDefault();
    } else {
      $('#reservationFormId').submit();
    }
  });
});
