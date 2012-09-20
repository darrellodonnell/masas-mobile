var quickReport_curPosition = undefined;

$( document ).delegate("#quickReport", "pagebeforecreate", function()
{
    quickReport_getCurrentPosition();
    quickReport_getLookupLocation();
});

$( document ).delegate("#quickReport_btnGPS", "vclick", function(event, ui)
{
     quickReport_getCurrentPosition();
});

$( document ).delegate("#quickReport_btnArrived", "vclick", function(event, ui)
{
    quickReport_sendQuickReport( app_Settings.reportCheckIn );
});

$( document ).delegate("#quickReport_btnDeparted", "vclick", function(event, ui)
{
    quickReport_sendQuickReport( app_Settings.reportCheckOut );
});

function quickReport_sendQuickReport( reportTitle )
{
    $.mobile.showPageLoadingMsg( "a", "Sending Report to MASAS..." );
    quickReport_enableControls( false );

    var report = new shortReportObj();

    report.Title = reportTitle;
    report.Description = $('#quickReport_txtNotes').val();

    var locationValue = $('input:radio[name=quickReport_locationChoice]:checked').val();
    if( locationValue == 'GPS' )
    {
        report.Location = quickReport_curPosition;
    }
    else if( locationValue == 'Lookup' ){
        report.Location = {
            latitude: location_latitude,
            longitude: location_longitude
        };
    }

    var entry = appShortReportToMASAS( report );
    delete report;

    MASAS_createNewEntry( entry, quickReport_reportSendSuccess, quickReport_reportSendFail );
}

function quickReport_reportSendSuccess()
{
    console.log( 'Report has been sent!' );

    quickReport_enableControls( true );
    $.mobile.hidePageLoadingMsg();
}

function quickReport_reportSendFail()
{
    console.log( 'Report could not be sent!' );

    quickReport_enableControls( true );
    $.mobile.hidePageLoadingMsg();
}

function quickReport_enableControls( enable )
{
    $( '#quickReport_txtNotes' ).attr( "readonly", !enable );

    if( enable )
    {
        $('input:radio[name=quickReport_locationChoice]').checkboxradio( 'enable' );

        $('#quickReport_btnArrived').removeClass('ui-disabled');
        $('#quickReport_btnDeparted').removeClass('ui-disabled');

        $('#quickReport_btnGPS').removeClass('ui-disabled');
        $('#quickReport_btnBack').removeClass('ui-disabled');
        $('#quickReport_btnLocation').removeClass('ui-disabled');
    }
    else
    {
        $('input:radio[name=quickReport_locationChoice]').checkboxradio( 'disable' );

        $('#quickReport_btnArrived').addClass('ui-disabled');
        $('#quickReport_btnDeparted').addClass('ui-disabled');

        $('#quickReport_btnGPS').addClass('ui-disabled');
        $('#quickReport_btnBack').addClass('ui-disabled');
        $('#quickReport_btnLocation').addClass('ui-disabled');
    }
}

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

function quickReport_getLookupLocation()
{
    if( location_latitude != undefined && location_longitude != undefined )
    {
        $('#quickReport_lblLookupPosition').text( location_latitude + ", " + location_longitude );
        $('#quickReport_lblLookupPositionDesc').text( location_selectedlookup );
    }
    else {
        $('#quickReport_lblLookupPosition').text( "N/A" );
        $('#quickReport_lblLookupPositionDesc').text( "" );
    }
}