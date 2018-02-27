(function() {
    var target = document.currentScript;
    var repoName = target.getAttribute("data-gmc-repo")
    var themeName = target.getAttribute('data-gmc-theme') || "gh_pure";
    
    var cdnBaseURL = "https://cdn.rawgit.com/tsucres/GithubManyfacedCards/master/dist/"
    
    var root_el = null;
    var numberOfRessourceToWaitFor = 2;
    function ressourceLoaded() {
        numberOfRessourceToWaitFor--;
        if (numberOfRessourceToWaitFor == 0) {
            (new GMC(root_el));
        }
    }
    function setStyle() {
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.type = 'text/css';
        link.href = cdnBaseURL + "themes/" + themeName + "/" + themeName + ".min.css";
        document.head.appendChild(link);
    }

    function setJs() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = ressourceLoaded;
        script.src = cdnBaseURL + "themes/" + themeName + "/" + themeName + ".min.js";
        target.parentNode.insertBefore(script, target.nextSibling);
    }

    function setTemplate() {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) { 
                if (request.status === 200) {
                    root_el = document.createElement('div');
                    root_el.setAttribute("data-gmc-repo", repoName);
                    root_el.innerHTML = request.responseText;
                    target.parentNode.insertBefore(root_el, target.nextSibling);
                    ressourceLoaded();
                } 
            } 
        };
        request.open('GET', cdnBaseURL + "themes/" + themeName + "/" + themeName + ".html");
        request.send();
    }

    setStyle();
    setJs();
    setTemplate();


}).call(this);