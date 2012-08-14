var frmQuickReport_curPosition = undefined;

$( document ).delegate("#frmQuickReport", "pagebeforecreate", function()
{
	frmQuickReport_getCurrentPosition();
});

$( document ).delegate("#frmQuickReport_btnGPS", "vclick", function(event, ui)
{
	 frmQuickReport_getCurrentPosition();
});

$( document ).delegate("#frmQuickReport_btnArrived", "vclick", function(event, ui)
{
	var report = new shortReportObj();
	
	report.Title = 'TEST - On Scene';
	report.Notes = $('#frmQuickReport_txtNotes').val();
	report.Location = frmQuickReport_curPosition;
	
	var entry = appShortReportToMASAS( report );
	MASAS_createNewEntry( entry );
});

$( document ).delegate("#frmQuickReport_btnDeparted", "vclick", function(event, ui)
{
	var report = new shortReportObj();
	
	report.Title = 'TEST - Leaving Scene';
	report.Notes = $('#frmQuickReport_txtNotes').val();
	report.Location = frmQuickReport_curPosition;
	
	var entry = appShortReportToMASAS( report );
	MASAS_createNewEntry( entry );
});

function frmQuickReport_updateLocation()
{
	if( frmQuickReport_curPosition != undefined )
	{
		$('#frmQuickReport_lblPosition').text( frmQuickReport_curPosition.latitude + ", " + frmQuickReport_curPosition.longitude );
	}
	else
	{
		$('#frmQuickReport_lblPosition').text( "N/A" );
	}	
}

function frmQuickReport_getCurrentPosition() {
	var gpsOptions = { maximumAge: 5000, timeout: 1000, enableHighAccuracy: true };
	
	$('#frmQuickReport_lblPosition').text( 'Waiting for location...' );
	navigator.geolocation.getCurrentPosition(frmQuickReport_onGetCurPosSuccess, frmQuickReport_onGetCurPosFail, gpsOptions);
}

function frmQuickReport_onGetCurPosSuccess( position ) {
	frmQuickReport_curPosition = position.coords;
	frmQuickReport_updateLocation();
}

function frmQuickReport_onGetCurPosFail( message ) {
	$('#frmQuickReport_lblPosition').text( 'N/A' );

	frmQuickReport_updateLocation();
}