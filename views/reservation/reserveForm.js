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

// Subtract one day from today's date due to timezone conversions
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

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

  // Initialize newStartDate as a Date object
  // Set newStartDate to day before end date
  let newEndDate = new Date(start);
  newEndDate.setDate(newEndDate.getDate() + min);

  // ** FORMATS START DATE TO YYYY-MM-DD (chatGPT) **
  // Get year
  // Get 0-based month, convert to 1-based month, convert to String then pad with 0's if needed 
  // Get day of month, pad with 0's if needed
  const startYear = start.getFullYear();
  const startMonth = String(start.getMonth() + 1).padStart(2, '0');
  const startDay = String(start.getDate()).padStart(2, '0');
  const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;

  // ** FORMATS END DATE TO YYYY-MM-DD (chatGPT) **
  const year = newEndDate.getFullYear();
  const month = String(newEndDate.getMonth() + 1).padStart(2, '0');
  const day = String(newEndDate.getDate()).padStart(2, '0');
  const formattedEndDate = `${year}-${month}-${day}`;

  // Replaces start date input to new start date (1 day prior end date)
  document.getElementById('reservationStartDate').value = formattedStartDate;
  document.getElementById('reservationEndDate').value = formattedEndDate;
  displayTotal(newEndDate, start);
};

/**
 * calculateTotal calculates the days from start to end dates
 * @param {*} end is a Date object representing the end date
 * @param {*} start is a Date object representing the start date
 */
function calculateTotal(end, start) {
  let length = end - start;
  let convertedLength = length / (1000 * 60 * 60 * 24);
  return convertedLength;

};

/**
 * displayTotal displays the total amount of days 
 * @param {*} end is a Date object representing the end date
 * @param {*} start is a Date object representing the start date
 */
function displayTotal(end, start) {
  const total = calculateTotal(end, start);
  // Only display length if 1 day or greater
  if (total > 0) {
    document.getElementById('reservationTotal').innerHTML = total + " days ! 🌱";
  };
  // };
};

/**
 * displayError displays error message msg.
 * @param {*} msg is the error message to be printed out.
 */
function displayError(msg) {
  $('#error-messages').html(`<div class="error">${msg}</div>`);
}

/**
 * validDates() warns the user if they inputted invalid dates: Error if user selects the same start and end dates; Error if start date is after end date; then calls resetDates() to adjust the dates to valid dates.
 */
function validDates() {

  // Clear error messages if any
  displayError("");

  let startDateValue = document.getElementById('reservationStartDate').value;
  let endDateValue = document.getElementById('reservationEndDate').value;

  // * NOTE: using Date constructor converts to ONE DAY BEHIND
  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

  // If total days is less than the minimum reservation period (21 days)
  if ((calculateTotal(endDate, startDate) < min) && calculateTotal(endDate, startDate) > 0) {
    displayError(`Minimum ${min} days to reserve a plot!`);
    resetDates(startDate, endDate);

    // If chosen dates are the same days (logical error)
  } else if (startDate.getTime() === endDate.getTime()) {
    resetDates(startDate, endDate);
    displayError(`Dates selected are the same!`);

    // If start date comes after end date (logical error)
  } else if (startDate.getTime() > endDate.getTime()) {

    resetDates(startDate, endDate);
    displayError(`Start date must be before end date!`)

    // Otherwise display the chosen days and calculate total
  } else {
    displayTotal(endDate, startDate);
  }
}

// Function for confirmation modal and submitting a form
$(document).ready(function () {

  $('#positive').on('click', function (event) {

    let startInput = document.getElementById('reservationStartDate').value;
    let endInput = document.getElementById('reservationEndDate').value;

    // Validates for empty fields
    if (!startInput || !endInput) {
      alert('All fields are required.');
      event.preventDefault();
    } else {
      $('#reservationFormId').submit();
    }
  });
});
