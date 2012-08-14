
$( document ).delegate("#frmSettings_btnClearData", "vclick", function(event, ui)
{
	localReports = [];
	window.localStorage.clear();
});
