/**
  Fetches the activity graph (svg) produced by github for the specified 
  repo and adds it to the specified HTMLElement.

  fullNameRepo: userName/repoName
  element: HTMLElement
  */
function getSparks(fullNameRepo, element) {
  var request = new XMLHttpRequest();
  var url = "https://github.com/" + fullNameRepo + "/graphs/participation?h=28&type=sparkline&w=155";
  request.open("GET", url); 
  
  request.onreadystatechange = function() {
    if (request.readyState === 4) { 
      if (request.status === 200) {
        var parser = new DOMParser();
        var spanSVG = parser.parseFromString(request.responseText, "text/html");
        var span = spanSVG.body.getElementsByTagName("span")[0];
        // Clear element's content
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        // Add sparks
        element.appendChild(span);
      }
    }
  }; 
  request.send();
  return "";

}