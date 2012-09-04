
$( document ).delegate("#confirmReportDelete_btnDelete", "vclick", function(event, ui)
{
    appLocalReports_removeReport( currentReport );
	currentReport = null;
	
	appSaveData();
	$.mobile.changePage( "viewReports.html", {} );
});
