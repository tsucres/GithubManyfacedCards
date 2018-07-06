/**
  Returns the specified iso formatted date into another format: "MMM dd yyyy"
  */
function formatDate(isoDateStr) {
  var date = new Date(isoDateStr);
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "September", "Oct",
    "Nov", "Dec"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  var yearStr = "";
  if (year != (new Date()).getFullYear()) {
    yearStr = ", " + String(year);
  }

  return  " " + monthNames[monthIndex] + " " + day + " " + yearStr;
}