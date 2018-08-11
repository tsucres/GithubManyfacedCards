function mailTo(emailAddress) {
	if (emailAddress) {
		return "mailto:" + emailAddress;
	} 
	return "";
}
function setBgImgUrl(imgUrl) {
	return "background-image: url(" + imgUrl + ");";
}
function humanReadable(num) {
   if(num == 0) return "0";
   var k = 1000,
       dm = 1,
       sizes = ["", " k", " M", " B", " T"],
       i = Math.floor(Math.log(num) / Math.log(k));
   return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}