/**
  Fetches the topics of the specified repo and add a markup in the 
  specified element.

  fullRepoName: userName/repoName
  element: HTMLElement in which the markup will be added.

  Note that it uses a preview feature of the fithub api, which might change in the feature
  https://developer.github.com/v3/repos/#list-all-topics-for-a-repository
  */
function fillWithTopics(fullRepoName, element, gmc) {
  /* 
  If the 'Accept = "application/vnd.github.mercy-preview+json"' 
  entry was added in the HTTP header of the initial api request, 
  the json of the GMC object should already contain the topics. 
  If not, we have to fetch the topics with a new api request, 
  with the 'Accept' header this time.
  */
  var currentJson = gmc.json;
  if (currentJson.hasOwnProperty("topics")) {
    fillMarkup(element, currentJson);
  } else {
    var url = "https://api.github.com/repos/" + fullRepoName + "/topics";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) { 
        if (request.status === 200) {
          var json = JSON.parse(request.responseText);
          var names = json["names"];
          fillMarkup(element, names);
          
        } /*else {
          console.log("failed to fetch topics");
        }*/
      } 
    };
    request.open('GET', url);
    request.setRequestHeader('Accept', 'application/vnd.github.mercy-preview+json');
    request.send();
  }

  

}

// topics = list of strings
function fillMarkup(element, topics) {
  topics.forEach(function(name) {
    var doc = element.ownerDocument;
    // <a href="/topics/datasource" class="topic-tag topic-tag-link f6 my-1">datasource</a>
    var topicA = doc.createElement("a");
    topicA.setAttribute("href", "https://github.com/topics/");
    topicA.setAttribute("class", "topic-tag topic-tag-link f6 my-1")
    topicA.textContent = name;
    element.appendChild(topicA);

  });
}