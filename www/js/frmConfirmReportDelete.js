
$( document ).delegate("#frmConfirmReportDelete_btnDelete", "vclick", function(event, ui)
{
	appLocalReports_deleteReport( currentReport );
	currentReport = null;
	
	appSaveData();
	$.mobile.changePage( "reports.html", {} );
});
