<!-- @if EMBED_GMC -->
<!-- @include ../../../gmc.js -->
<!-- @include getParamValue.js -->

(function(d) {
	var repoName = getParamValue('rn');
	if (repoName) {
		d.body.setAttribute("data-gmc-repo", repoName);
		(new GMC(d.body));
	} else {
		console.error("The name of the repo should be specified in the src of the iframe: src='themeName.gmc.min.html?rn=user/repo'");
	}
	
})(document)
<!-- @endif -->