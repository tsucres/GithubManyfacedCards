(function() {
    var target = document.currentScript;
    var repoName = target.getAttribute("data-gmc-repo");
    var userName = target.getAttribute("data-gmc-user");
    var themeName = target.getAttribute('data-gmc-theme') || "gh_pure";
    var themeUrl = target.getAttribute('data-gmc-theme-url');

    var cdnBaseURL = "https://cdn.jsdelivr.net/gh/tsucres/GithubManyfacedCards@0.3.0/dist/"
    
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

    function setTemplate(themeUrl) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) { 
                if (request.status === 200) {
                    root_el = document.createElement('div');
                    if (repoName) {
                        root_el.setAttribute("data-gmc-repo", repoName);
                    } else {
                        root_el.setAttribute("data-gmc-user", userName);
                    }
                    root_el.innerHTML = request.responseText;
                    target.parentNode.insertBefore(root_el, target.nextSibling);
                    ressourceLoaded();
                } 
            } 
        };
        var url = themeUrl || cdnBaseURL + "themes/" + themeName + "/" + themeName + ".html"
        request.open('GET', url);
        request.send();
    }
    if (themeUrl) {
        setTemplate(themeUrl);
    } else {
        setStyle();
        setJs();
        setTemplate();
    }
}).call(this);