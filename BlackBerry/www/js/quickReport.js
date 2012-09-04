var quickReport_curPosition = undefined;

$( document ).delegate("#quickReport", "pagebeforecreate", function()
{
	quickReport_getCurrentPosition();
});

$( document ).delegate("#quickReport_btnGPS", "vclick", function(event, ui)
{
	 quickReport_getCurrentPosition();
});

$( document ).delegate("#quickReport_btnArrived", "vclick", function(event, ui)
{
	var report = new shortReportObj();
	
	report.Title = 'TEST - On Scene';
	report.Description = $('#quickReport_txtNotes').val();
	report.Location = quickReport_curPosition;
	
	var entry = appShortReportToMASAS( report );
    delete report;

	MASAS_createNewEntry( entry );
});

$( document ).delegate("#quickReport_btnDeparted", "vclick", function(event, ui)
{
	var report = new shortReportObj();
	
	report.Title = 'TEST - Leaving Scene';
	report.Description = $('#quickReport_txtNotes').val();
	report.Location = quickReport_curPosition;
	
	var entry = appShortReportToMASAS( report );
    delete report;

	MASAS_createNewEntry( entry );
});

function quickReport_updateLocation()
{
	if( quickReport_curPosition != undefined )
	{
		$('#quickReport_lblPosition').text( quickReport_curPosition.latitude + ", " + quickReport_curPosition.longitude );
	}
	else
	{
		$('#quickReport_lblPosition').text( "N/A" );
	}	
}

function quickReport_getCurrentPosition() {
	var gpsOptions = { maximumAge: 5000, timeout: 10000, enableHighAccuracy: true };
	
	$('#quickReport_lblPosition').text( 'Waiting for location...' );
	navigator.geolocation.getCurrentPosition(quickReport_onGetCurPosSuccess, quickReport_onGetCurPosFail, gpsOptions);
}

function quickReport_onGetCurPosSuccess( position ) {
	quickReport_curPosition = position.coords;
	quickReport_updateLocation();
}

function quickReport_onGetCurPosFail( message ) {
	$('#quickReport_lblPosition').text( 'N/A' );

	quickReport_updateLocation();
}