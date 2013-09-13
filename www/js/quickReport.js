/**
 * MASAS Mobile - Quick/Short Report Page
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var quickReport_curPosition = undefined;

$( document ).delegate("#quickReport", "pagebeforecreate", function()
{
    quickReport_loadData();
    quickReport_getLookupLocation();

    // Setup the UI as per the state of the report...
    if( !mmApp.activeShortReport )
    {
        quickReport_getCurrentPosition();

        $("#quickReport_btnConfirm").hide();
        $("#quickReport_btnUpdate").hide();
        $("#quickReport_btnDeparted").hide();
    }
    else
    {
        $("#quickReport_btnArrived").hide();
        $("#quickReport_btnUpdate").show();
        $("#quickReport_btnDeparted").show();

        if( !mmApp.activeShortReport.confirmed )
        {
            $("#quickReport_btnConfirm").show();
        }
        else {
            $("#quickReport_btnConfirm").hide();
        }

        // Load the content...
        $('#quickReport_txtNotes').val( mmApp.activeShortReport.masasEntry.GetContent() );
    }
});

$( document ).delegate("#quickReport", "pagebeforeshow", function( event, ui )
{
    app_onCoverageChange();
});

$( document ).delegate( "#quickReport", "pageshow", function( event, ui )
{
    quickReport_resizePage();
});

$( document ).delegate( "#quickReport", "updatelayout", function( event, ui )
{
    // Reset the Page Padding...
    quickReport_resetPagePadding();
});

$( document).delegate("#quickReport_txtNotes", "change", function( event, ui )
{
    if( mmApp.activeShortReport ) {
        mmApp.activeShortReport.masasEntry.SetContent( $('#quickReport_txtNotes').val() );
    }
    quickReport_saveData();
});

$( document ).delegate("#quickReport_btnGPS", "vclick", function(event, ui)
{
     quickReport_getCurrentPosition();
});

$( document ).delegate("#quickReport_btnArrived", "vclick", function(event, ui)
{
    mmApp.activeShortReport = new MASASMobile.ShortReportModel();
    mmApp.activeShortReport.masasEntry.SetTitle( app_Settings.reportCheckIn );
    mmApp.activeShortReport.masasEntry.SetContent( $('#quickReport_txtNotes').val() );

    quickReport_sendQuickReport( mmApp.activeShortReport,
        function( xml, entry ) {
            // Custom success handler...
            $("#quickReport_btnArrived").hide();
            $("#quickReport_btnConfirm").show();
            $("#quickReport_btnUpdate").show();
            $("#quickReport_btnDeparted").show();

            // Common Success handler...
            quickReport_reportSendSuccess( xml, entry );
        },
        function( msg ) {
            // Custom failure handler...
            mmApp.activeShortReport = null;
            quickReport_reportSendFail( msg );
        } );
});

$( document ).delegate("#quickReport_btnConfirm", "vclick", function(event, ui)
{
    mmApp.activeShortReport.masasEntry.SetTitle( app_Settings.reportCheckIn + " - CONFIRMED" );
    quickReport_sendQuickReport( mmApp.activeShortReport,
        function( xml, entry ) {
            // Custom success handler...
            mmApp.activeShortReport.confirmed = true;
            $("#quickReport_btnConfirm").hide();

            // Common Success handler...
            quickReport_reportSendSuccess( xml, entry );
        },
        quickReport_reportSendFail );

});

$( document ).delegate("#quickReport_btnUpdate", "vclick", function(event, ui)
{
    mmApp.activeShortReport.masasEntry.SetTitle( app_Settings.reportCheckIn + " - UPDATED" );
    quickReport_sendQuickReport( mmApp.activeShortReport, quickReport_reportSendSuccess, quickReport_reportSendFail );
});

$( document ).delegate("#quickReport_btnDeparted", "vclick", function(event, ui)
{
    mmApp.activeShortReport.masasEntry.SetTitle( app_Settings.reportCheckOut );
    quickReport_sendQuickReport( mmApp.activeShortReport,
        function( xml, entry ) {
            // Custom success handler...
            $("#quickReport_btnArrived").show();
            $("#quickReport_btnConfirm").hide();
            $("#quickReport_btnUpdate").hide();
            $("#quickReport_btnDeparted").hide();

            $('#quickReport_txtNotes').val( "" );

            // Done with this report...
            mmApp.activeShortReport = undefined;

            // Common Success handler...
            quickReport_reportSendSuccess( xml, entry );
        },
        quickReport_reportSendFail );
});

function quickReport_sendQuickReport( report, callback_success, callback_failure )
{
    quickReport_saveData();

    if( app_hasDataCoverage() )
    {
        $.mobile.showPageLoadingMsg( "a", "Sending Report to MASAS..." );
        quickReport_enableControls( false );

        mmApp.activeShortReport.masasEntry.SetContent( $('#quickReport_txtNotes').val() );

        var locationValue = $('input:radio[name=quickReport_locationChoice]:checked').val();
        if( locationValue == 'GPS' )
        {
            report.location = quickReport_curPosition;
        }
        else if( locationValue == 'Lookup' ){
            report.location = {
                latitude: location_latitude,
                longitude: location_longitude
            };
        }

        mmApp.masasPublisher.PublishShortReport( report, callback_success, callback_failure )
    }
    else
    {
        alert( "Data coverage in unavailable! Please try again later.");
    }
}

function quickReport_reportSendSuccess( xml, entry )
{
    console.log( 'Report has been sent!' );

    if( mmApp.activeShortReport != undefined )
    {
        mmApp.activeShortReport.masasEntry = entry;
        mmApp.activeShortReport.state = MASASMobile.EntryStateEnum.published;
    }

    quickReport_enableControls( true );
    quickReport_saveData();
    $.mobile.hidePageLoadingMsg();
}

function quickReport_reportSendFail( msg )
{
    var errorMsg = "Report could not be sent! Error: " + msg;
    console.log( errorMsg );

    alert( errorMsg );

    quickReport_enableControls( true );
    $.mobile.hidePageLoadingMsg();
}

function quickReport_enableControls( enable )
{
    $( "#quickReport_txtNotes" ).attr( "readonly", !enable );

    if( enable )
    {
        $("#quickReport").removeClass( "ui-disabled" );
    }
    else
    {
        $("#quickReport").addClass("ui-disabled");
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

function quickReport_getCurrentPosition()
{
    var gpsOptions = { maximumAge: 0, timeout: 10000, enableHighAccuracy: true };

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

function quickReport_loadData()
{
    var storage = window.localStorage;
    var quickReportData = storage.getItem( "QuickReport" );

    if( quickReportData != undefined )
    {
        quickReportData = JSON.parse( quickReportData );

        var entryXml = quickReportData.entryXml;
        var xmlDoc = jQuery.parseXML( entryXml );
        var $xml = $( xmlDoc );
        var $feedEntry = $xml.find( "entry" );

        mmApp.activeShortReport = new MASASMobile.ShortReportModel();
        mmApp.activeShortReport.confirmed = Boolean( quickReportData.confirmed );
        mmApp.activeShortReport.state = quickReportData.state;
        mmApp.activeShortReport.masasEntry.FromNode( $feedEntry[0] );
    }
}

function quickReport_saveData()
{
    var storage = window.localStorage;

    // Store the local reports...
    var quickReportData = undefined;

    if( mmApp.activeShortReport != undefined )
    {
        quickReportData = {
            confirmed: mmApp.activeShortReport.confirmed,
            state: mmApp.activeShortReport.state,
            entryXml: mmApp.activeShortReport.masasEntry.ToXML()
        }
        quickReportData = JSON.stringify( quickReportData );

        storage.setItem( "QuickReport", quickReportData );
    }
    else {
        // Clear the item if it exists...
        storage.removeItem( "QuickReport" );
    }
}

function quickReport_resizePage()
{
    var header = $.mobile.activePage.children( '[data-role="header"]' );
    var footer = $.mobile.activePage.children( '[data-role="footer"]' );
    var content = $.mobile.activePage.children( '[data-role="content"]' );

    var header_height  = $(header).height() + parseInt( $(header).css( "border-top-width" ), 10 ) + parseInt( $(header).css( "border-bottom-width" ), 10 );
    var footer_height  = $(footer).height() + parseInt( $(footer).css( "border-top-width" ), 10 ) + parseInt( $(footer).css( "border-bottom-width" ), 10 );
    var window_height  = $(window).height();
    var content_padding = parseInt( $(content).css( "padding" ), 10 );

    // iPad is reporting 1024 for both height and width so need to force the height
    // (20 is height of standard iOS information bar (signal, time, battery, etc.)
    if (iOS.device.iPad) {
        window_height = 768 - 20;
    }

    // Resize the Main Panel
    var height = ( window_height - header_height - footer_height ) - ( content_padding * 2 );
    $(content).height( height );
    $(content).css( "max-height", height );
}

function quickReport_resetPagePadding()
{
    // "Fix" the padding on the page...
    var footer_height  = $.mobile.activePage.children( '[data-role="footer"]' ).height();
    $("#quickReport").css( "padding-bottom", footer_height );
}