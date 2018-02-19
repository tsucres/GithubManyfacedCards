function _hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);
  else
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}
function _hasData(el, dataName) {
  if (el.dataset)
    return el.dataset.hasOwnProperty(dataName);
  else
    return el.getAttribute('data-' + dataName);
}

function resizeIframe(obj) {
  obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

function fetchJson(url, success, fail, httpHeaders) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === 4) { 
      if (request.status === 200) {
        success(JSON.parse(request.responseText));
      } else {
        fail();
      }
    } else {
      // HTTP is continuing....
    }
  };
  request.open('GET', url);
  var httpHeaders = httpHeaders || {};
  Object.keys(httpHeaders).forEach(function(key) {
    request.setRequestHeader(key, httpHeaders[key]);
  });
  request.send();
}
/*
2 possible initializations: 
  1. (iframe + data-gmc-theme + data-gmc-repo).
  2. (root_el + data-gmc-repo) containing the template markup.

In the first case, the template will be downloaded (using 
themesBaseURL + themeName) and loaded inside the iframe. The 
body can then be used as the root_el, leading us to the same 
situation as in case 2.

To speed up things, the theme (inside the iframe) and the json 
from the api can load at the same time.

*/

function GMC(root_el, json) { 'use strict';
  var self = this;

  // url used to locate a theme template from its name: (themeBaseURL + themeName + .html)
  var themesBaseURL = "https://cdn.rawgit.com/tsucres/GithubManyfacedCards/master/dist/themes/";
  // github api url to retrieve repo data: (repoApiURL + repoFullName)
  var repoApiURL = "https://api.github.com/repos/";

  this.repoFullName = root_el.getAttribute("data-gmc-repo");
  this.json = json;
  this.root_el = null;

  /**
    Fetch the json data about the repo whose name is in 
    self.repoFullName and fill them in the template.
  */
  this.fillWithRepoName = function() {
    var headers = {};
    if (typeof GH_API_KEY === "string") {
      headers["Authorization"] = "token " + GH_API_KEY; // Untested!!!!
    }
    headers['Accept'] = "application/vnd.github.mercy-preview+json";
    fetchJson(repoApiURL + self.repoFullName, function(json) {
      self.json = json
      self.fillWithRepoJson();
    }, function() {
      self.markError();
      //console.log("Shout! Json failed loading!");
    }, headers);
  }

  /**
    Find all the elements (inside self.root_el) having a 
    'data-gmc-id' attribute and fill them using the data pointing 
    by this attribute in self.json.
    It requires root_el, json and repoName to be filled. Otherwise 
    it quits.
    */
  this.fillWithRepoJson = function() {
    if (!(self.root_el && self.json && self.repoFullName))
      return
    var elements = self.root_el.querySelectorAll('[data-gmc-id]');
    elements.forEach(function(el) {
      gcm_fill_one_el_with_json(el, self.json)
    });
    this.markAsLoaded();
    if (typeof this.iframe === "object") {
      resizeIframe(this.iframe);
    }
  }

  /// Add the class 'gmc-loaded' to root_el
  this.markAsLoaded = function() {
    self.root_el.className += ' gmc-loaded';
  }
  /// Add the class 'gmc-error' to root_el
  this.markError = function() {
    self.root_el.className += ' gmc-error';
  }

  /**
    Parses the attributes of the specified element, looking for 
    'data-gm-id'. Fill the specified element with the data pointed 
    by this attribute in json.

    element: HTMLElement with specified data-gmc-id
    json: json retrieved from github api
    */
  function gcm_fill_one_el_with_json(element, json) {
    var gmcId = element.getAttribute("data-gmc-id");
    if (gmcId) {
      gmcId = gmcId.replace(" ", "");
      var gmcIdList = gmcId.split(",");
      gmcIdList.forEach(function(id) {
        gmc_fill_one_el_with_gmc_id(element, json, id);
      });
    }
  }

  /**
    Fill the specified element with the right data from json.

    element: HTMLElement
    json: json retrieved from github api.
    gmcId: a string with format where__what[__js]. If '__js' is 
      specified, then element should also have a 'data-gmc-js' 
      attribute. Otherwise it's just ignored.
    */
  function gmc_fill_one_el_with_gmc_id(element, json, gmcId) {
    var splitted = gmcId.split("__");
    if (splitted.length < 2)
      return // It should at least have a 'what' and a 'where'

    var what = splitted[1];
    var where = splitted[0];
    var js = (splitted.length >= 2 
              && splitted[2] == "js" 
              && element.getAttribute("data-gmc-js"));
    gmc_fill_one_el_with_wwj(element, json, what, where, js);
  }

  /**
    basically does the following: element.where += js(json[what])

    element: HTMLElement to which the "what" will be added.
    json: the json resulting the github api
    what: a key in the json. The hierarchy has to be marked using a 
      dash '-'.
    where: the attribute (from element) to which the jsonValue will be 
      assigned
    js: a boolean indicating whether there is a 'data-gmc-js' attribute 
      n the 'element'. If so, the javascript code it contains will be 
      evaluated as a function with, as a parameter, the jsonValue. This 
      code should return a value that will be assign to 'where'.
    */
  function gmc_fill_one_el_with_wwj(element, json, what, where, js) {
    var splittedWhat = what.split("-");
    var subJson = json;
    var jsonValue = null;
    splittedWhat.some(function(whatPart) {
      if (!subJson.hasOwnProperty(whatPart))
        return true;
      else if (typeof subJson[whatPart] === "object") {
        subJson = subJson[whatPart];
      } else {
        jsonValue = subJson[whatPart];
        return true;
      }
      
    });

    if (js) {
      var jsFunction = element.getAttribute("data-gmc-js");
      var doc = element.ownerDocument;
      var win = doc.defaultView || doc.parentWindow;
      if(typeof win[jsFunction] === "function")
        jsonValue = win[jsFunction].call(null, jsonValue, element, self);
    }
    if (jsonValue === null) {
      return
    }
    var ap = typeof self.root_el.getAttribute("data-gmc-ap") === "string";
    if (where == "in") {
      var textBackup = ap ? element.textContent : "";
      element.textContent = textBackup + jsonValue;
    } else {
      var whereBackup = "";
      if (ap && element.hasAttribute(where)) {
        whereBackup = element.getAttribute(where);
      }
      element.setAttribute(where, whereBackup + jsonValue);

    }

    
  }



  if (root_el.tagName === "IFRAME") {
    // case 1)
    this.iframe = root_el;
    root_el.onload = function() {
      self.root_el = root_el.contentWindow.document.body;
      // This is async, in race with the download of the json data. 
      // If the json isn't fetched yet, the call to this function will 
      // just return.
      self.fillWithRepoJson(); 
    };
    /*root_el.onerror = function() {
      console.log("error root");
    }*/
    if (root_el.getAttribute("data-gmc-theme-url")) {
      root_el.src = root_el.getAttribute("data-gmc-theme-url");
    } else {
      var themeName = root_el.getAttribute("data-gmc-theme") || "gh_pure";
      root_el.src = themesBaseURL + themeName + ".html";
    }
    
  } else { 
    // case 2)
    self.root_el = root_el;
  }
  if (this.json) {
    this.fillWithRepoJson();
  } else {
    this.fillWithRepoName();
  }
}

/**
  loadAllCards([json])
  Calls (new GMC(el, json)) for every elemement selected by 
  '[data-gmc-repo]'
  
  if json is not specified, it will be downloaded from the api 
  using the repo name specified in data-gmc-repo.
  */
GMC.loadAllCards = function(json) {
  var iframes = document.querySelectorAll('[data-gmc-repo]');
  iframes.forEach(function(iframe) {
    (new GMC(iframe, json));
  });
}

//window.onload = GMC.loadAllCards