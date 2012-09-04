
$( document ).delegate("#frmConfirmImageDelete_btnDelete", "vclick", function(event, ui)
{
	currentReport.DeleteAttachment( currentImage );
	currentImage = null;
	appSaveData();
	
	$.mobile.changePage( "frmReport.html", {} );
});
