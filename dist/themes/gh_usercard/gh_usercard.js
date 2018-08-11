function mailTo(emailAddress) {
	if (emailAddress) {
		return "mailto:" + emailAddress;
	} 
	return "";
}