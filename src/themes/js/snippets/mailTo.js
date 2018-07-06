function mailTo(emailAddress, element) {
	if (emailAddress) {
		return "mailto:" + emailAddress;
	} else {
		element.style.visibility = "hidden";
		return "";
	}
}