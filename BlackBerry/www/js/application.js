/**
 * MASAS Mobile - Application Core
 * Updated: Nov 05, 2012
 * Independent Joint Copyright (c) 2011-2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var app_GoogleAPIKey = "";

var bb = {
    device: {
        isHighRes: false,
        isBB5: false,
        isBB6: false,
        isBB7: false,
        isBB10: false,
        isPlayBook: false
    }
}

var localReports = [];

var app_Settings = null;

var currentReport = null;
var currentAttachment = null;
var app_DefaultLocation = { latitude: 42.999444, longitude: -82.308889 };

var app_IsAppInitialized = false;
var app_IsMapSupported = false;
var app_MapScriptState = "NONE"; // NONE, LOADING, LOADED, READY;

$(document).on("mobileinit", function(){
    jQuery.support.cors = true;
    $.mobile.ajaxEnable = false;
    $.mobile.pushStateEnabled = false;
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
    $.mobile.allowCrossDomainPages = true;

    app_initApplication();
});

$(document).ready( function()
{
    // Handler for .ready() called.
    document.addEventListener("deviceready", app_onDeviceReady, false);
});

$(window).bind( 'orientationchange', function(e)
{
    if( $.mobile.activePage.attr('id') == "viewMASAS" )
    {
        viewMASAS_resizePage();
    }
});

function app_onDeviceReady()
{
    // Cordova is loaded...
    document.addEventListener("online", app_onDeviceOnline, false);
    document.addEventListener("offline", app_onDeviceOffline, false);
}

function app_initApplication()
{
    if( !app_IsAppInitialized )
    {
        // Initialize the app...
        app_getDeviceInfo();

        // Enable Maps Support if needed...
        if( bb.device.isPlayBook || bb.device.isBB10 )
        {
            app_IsMapSupported = true;
            app_loadMapScript();
        }

        // Load the menu...
        menu_initMenu();

        // Load the application data...
        appLoadData();

        // Attach to some BlackBerry specific events...
        if( app_isDeviceBB567() )
        {
            if( blackberry.system.event.onHardwareKey )
            {
                blackberry.system.event.onHardwareKey( blackberry.system.event.KEY_BACK, app_onBackKey );
            }

            if( blackberry.system.event.onCoverageChange )
            {
                blackberry.system.event.onCoverageChange( app_onCoverageChange );
            }
        }

        // TODO: Verify if we need this of BB10
        if( ( app_isDeviceBB567() || app_isDevicePlayBook() ) )
        {
            if( blackberry.app.event.onForeground )
            {
                blackberry.app.event.onForeground( app_onForeground );
            }


        }

        if( app_isDevicePlayBook() )
        {
            if( blackberry.app.event.onSwipeDown )
            {
                blackberry.app.event.onSwipeDown( app_onSwipeDown );
            }
        }
    }
}

function app_getDeviceInfo()
{
    // Let's figure out what platform we are on...
    bb.device.isPlayBook = ( navigator.userAgent.indexOf( 'PlayBook' ) >= 0 ) || ( ( window.innerWidth == 1024 && window.innerHeight == 600 ) || ( window.innerWidth == 600 && window.innerHeight == 1024 ) );
    bb.device.isBB10 = ( navigator.userAgent.indexOf( 'Version/10.0' ) >= 0 );
    bb.device.isBB7 = ( navigator.userAgent.indexOf( '7.0.0' ) >= 0 ) || ( navigator.userAgent.indexOf( '7.1.0' ) >= 0 );
    bb.device.isBB6 = navigator.userAgent.indexOf( '6.0.0' ) >= 0;
    bb.device.isBB5 = navigator.userAgent.indexOf( '5.0.0 ') >= 0;

    // Determine if we have a high resolution screen...
    bb.device.isHighRes = screen.width > 480 || screen.height > 480;
}

function app_isDeviceBB567()
{
    return ( bb.device.isBB7 || bb.device.isBB6 || bb.device.isBB5 );
}

function app_isDevicePlayBook()
{
    return bb.device.isPlayBook;
}

function app_isDeviceBB10()
{
    return bb.device.isBB10;
}

function app_onBackKey() {
   history.back();
   return false;
}

function app_onDeviceOnline()
{
    app_onCoverageChange();
}

function app_onDeviceOffline()
{
    app_onCoverageChange();
}

function app_onCoverageChange()
{
    var status = $('#app_dataStatus');

    if( app_hasDataCoverage() )
    {
        if( status )
        {
            status.data('icon', 'check');
            $("#app_dataStatus .ui-icon").addClass("ui-icon-check").removeClass("ui-icon-alert");
        }
    }
    else
    {
        if( status )
        {
            status.data('icon', 'alert');
            $("#app_dataStatus .ui-icon").addClass("ui-icon-alert").removeClass("ui-icon-check");
        }
    }
}

function app_hasDataCoverage()
{
    var hasDataCoverage = false;

    if( blackberry && blackberry.system )
    {
        hasDataCoverage = blackberry.system.hasDataCoverage();
    }
    else
    {
        var networkState = navigator.network.connection.type;
        hasDataCoverage = !( networkState == Connection.NONE);
    }

    return hasDataCoverage;
}

function app_onForeground()
{
    // update the coverage icon if needed...
    app_onCoverageChange();
}

function app_onSwipeDown()
{
    if( $.mobile.activePage.attr('id') == "viewMASAS" )
    {
        viewMASAS_showMenu();
    }
}

Date.prototype.toJSON = function (key) {
    return this.toISOString();
};

function appResetSettingsToDefault()
{
    app_Settings = {
        url: 'https://sandbox2.masas-sics.ca/hub',
        token: '12345',
        vehicleId: '',
        vehicleType: 'EmergencyTeam', // EmergencyTeam, EMS, Fire, Police, Other
        reportStatus: 'Test', // Test, Actual
        reportExpiresOffset: 60,
        reportExpiresContext: "Minutes", // Minutes, Hours, Days
        reportCheckIn: "Arriving at Scene",
        reportCheckOut: "Departing Scene",
        map: {
            defaultCenter: {
                lat: 65.0,
                lon: -109.0
            },
            defaultZoom: 3
        },
        hub : {
            filters: [ {
                    enable: false,
                    type: 'bbox',  // box, radius
                    data: ''
            } ]
        }
    };
}

function appLoadData()
{
    var storage = window.localStorage;

    // Load Hub settings...
    var MASAS_Settings = storage.getItem( "Settings" );
    if( MASAS_Settings == null )
    {
        appResetSettingsToDefault();
    }
    else {
        app_Settings = JSON.parse( MASAS_Settings );
    }

    // Load Reports...
    var jsonReports = storage.getItem( "Reports" );
    var reports = null;

    if( jsonReports != null )
    {
        try
        {
            reports = JSON.parse(jsonReports, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });
        }
        catch(err)
        {
            alert('Failed because: ' + err);
        }
    }

    if( reports != null )
    {
        for( var i=0; i<reports.length; i++ )
        {
            // Copy the "data" objects into our proper objects...
            var report = new reportObj( reports[i] );
            localReports.push( report );
        }
    }
}

function appSaveData()
{
    var storage = window.localStorage;

    // Store the local reports...
    var value = JSON.stringify( localReports );
    storage.setItem( "Reports", value );
}

function appSaveSettingsData()
{
    var storage = window.localStorage;

    // Store the MASAS settings...
    var value = JSON.stringify( app_Settings );
    storage.setItem( "Settings", value );
}

function appDeleteReports()
{
    localReports.length = 0;
}

function appLocalReports_removeReport( report )
{
    for( var i=0; i<localReports.length; i++ )
    {
        if( report === localReports[i] )
        {
            var localReport = localReports[i];
            localReports.splice( i, 1 );

            localReport = null;
            break;
        }
    }
}

function appShortReportToMASAS( report )
{
    var augmentedTitle = report.Title + ' [' + app_Settings.vehicleId + ']';

    var masasEntry =
        {
            "title":    augmentedTitle,
            "content":  report.Description,
            "status":   app_Settings.reportStatus,
            "icon":     appGetSimpleReportIcon(),
            "expires":  appGetReportExpiration()
        };

    if( report.Location != undefined && report.Location != null )
    {
        masasEntry.point = {
                "latitude":     report.Location.latitude,
                "longitude":    report.Location.longitude
            }
    }
    else {
        masasEntry.point = app_DefaultLocation;
    }

    return masasEntry;
}

var app_callback_reportSent = null;
var app_callback_reportSendFail = null;
var app_callback_reportGenerated = null;
var app_generatedMasasEntry = null;

function appSendReportToMASAS( report, callback_reportSent, callback_reportSendFailed )
{
    app_callback_reportSent = callback_reportSent;
    app_callback_reportSendFail = callback_reportSendFailed;

    // Create MASAS Report...
    appGenerateMASASEntry( report, appMASASReportGenerated );
}

function appMASASReportGenerated( masasEntry )
{
    console.log( 'MASAS Report has been generated! Attempting to send.' );
    console.log( masasEntry );

    MASAS_createNewEntry( masasEntry, app_MASAS_createNewEntry_success, app_MASAS_createNewEntry_fail );

}

function app_MASAS_createNewEntry_success()
{
    console.log( 'MASAS Entry created!' );
    if( app_callback_reportSent && typeof( app_callback_reportSent ) === "function" )
    {
        app_callback_reportSent();
    }
}

function app_MASAS_createNewEntry_fail()
{
    console.log( 'MASAS Entry creation failed!' );
    if( app_callback_reportSendFail && typeof( app_callback_reportSendFail ) === "function" )
    {
        app_callback_reportSendFail();
    }
}

function appGenerateMASASEntry( report, callback_reportGenerated )
{
    app_callback_reportGenerated = callback_reportGenerated;

    var augmentedTitle = report.Title + ' [' + app_Settings.vehicleId + ']';

    app_generatedMasasEntry =
        {
            "title":        augmentedTitle,
            "content":      report.Description,
            "status":       app_Settings.reportStatus,
            "icon":         appGetReportIcon( report.Symbol ),
            "expires":      appGetReportExpiration(),
            "attachments":  []
        };

    // Default location...
    app_generatedMasasEntry.point = app_DefaultLocation;

    // Figure out the real location, if it exists...
    if( report.UseLocation == "GPS" )
    {
        if( report.Location != undefined && report.Location != null )
        {
            app_generatedMasasEntry.point = {
                    "latitude":     report.Location.latitude,
                    "longitude":    report.Location.longitude
                }
        }
    }
    else {
        if( report.LookupLocation.Location != undefined && report.LookupLocation.Location != null )
        {
            app_generatedMasasEntry.point = {
                "latitude":     report.LookupLocation.Location.latitude,
                "longitude":    report.LookupLocation.Location.longitude
            }
        }
    }

    app_generatedMasasEntry.attachments = [];
    // setup the data up front so we don't have any data access problems...
    for( var i=0; i<report.Attachments.length; i++ )
    {
        var attachment = {
            path:           report.Attachments[i].Path,
            fileName:       report.Attachments[i].Path.replace(/^.*[\\\/]/, ''),
            contentType:    report.Attachments[i].Type,
            description:    ''
        }
        app_generatedMasasEntry.attachments.push( attachment );
    }

    // Convert each attachment to BASE64
    if( app_generatedMasasEntry.attachments.length > 0 )
    {
        for( var i=0; i< app_generatedMasasEntry.attachments.length; i++ )
        {
            console.log( 'Opening file: ' + report.Attachments[i].Path );

            // TODO: Change to PhoneGap logic...
            if( blackberry && blackberry.io.file.exists( report.Attachments[i].Path ) )
            {
                blackberry.io.file.readFile( report.Attachments[i].Path, app_handleOpenedFile );
            }
            else
            {
                // Failure!
                // TODO: THIS ISN'T THE RIGHT LOGIC!
                if( app_callback_reportGenerated && typeof( app_callback_reportGenerated ) === "function" )
                {
                    app_callback_reportGenerated( app_generatedMasasEntry );
                }
            }
        }
    }
    else
    {
        // No attachements, we are done...
        if( app_callback_reportGenerated && typeof( app_callback_reportGenerated ) === "function" )
        {
            app_callback_reportGenerated( app_generatedMasasEntry );
        }
    }
}

function app_handleOpenedFile( fullPath, blobData )
{
     console.log( 'File opened: ' + fullPath );

     var attachment = null;
     for( var i=0; i<app_generatedMasasEntry.attachments.length; i++ )
     {
        if( app_generatedMasasEntry.attachments[i].path == fullPath )
        {
            attachment = app_generatedMasasEntry.attachments[i];
            break;
        }
     }

     if( attachment != null )
     {
        // TODO: Add PhoneGap support.
        if( blackberry && blackberry.utils )
        {
            attachment.base64 = blackberry.utils.blobToString( blobData, 'BASE64' );
        }
        else
        {
            console.log( 'Error: Platform not supported!' );
        }

     }
     else {
        console.log( 'Error: Could not match the attachment!' );
     }

     app_checkIfAllAttachmentsLoaded();
}

function app_checkIfAllAttachmentsLoaded()
{
    var count = 0;
    for( var i=0; i<app_generatedMasasEntry.attachments.length; i++ )
    {
        if( app_generatedMasasEntry.attachments[i].base64 != undefined )
        {
            count++;
        }
    }

    if( count == app_generatedMasasEntry.attachments.length )
    {
        // We are done...
        if( app_callback_reportGenerated && typeof( app_callback_reportGenerated ) === "function" )
        {
            app_callback_reportGenerated( app_generatedMasasEntry );
        }
    }
    else {
        console.log( 'Only ' + count + ' attachments have been converted.' );
    }
}

function appGetSimpleReportIcon()
{
    var returnVal = 'other';

    // Setup the icon based on the desired type...
    switch( app_Settings.vehicleType )
    {
        case "EmergencyTeam":
            returnVal = 'ems/operations/emergency/emergencyTeam';
            break;
        case "EMS":
            returnVal = 'ems/operations/emergencyMedical/ambulance';
            break;
        case "Fire":
            returnVal = 'ems/operations/emergencyFire/fireTruck';
            break;
        case "Police":
            returnVal = 'ems/operations/lawEnforcement/policeCar';
            break;
        case "Other":
            returnVal = 'other';
            break;
        default:
            returnVal = 'other';
            break;
    }

    // Return the proper value.
    return returnVal;
}

function appGetReportIcon( symbol )
{
    var returnVal = "";

    if( symbol == "ems.other.other" )
    {
        returnVal = "other";
    }
    else
    {
        returnVal = symbol.replace(/\./g, "/" );
    }

    console.log( "Symbol: " + returnVal );

    return returnVal;
}

function appGetReportExpiration()
{
    // Get the current date/time...
    var reportExpires = new Date();
    console.log( 'New Date:' + reportExpires.toISOString() );

    // Make sure our offset is an integer...
    var expiresOffset = parseInt( app_Settings.reportExpiresOffset, 10 );

    // Validate the range, just in case...
    if( expiresOffset > 14400 ) {
        expiresOffset = 14400;
    }
    else if( expiresOffset < 1 ) {
        expiresOffset = 1;
    }

    // What's the context, and offset the time accordingly...
    switch( app_Settings.reportExpiresContext )
    {
        case "Minutes":
            reportExpires.setMinutes( reportExpires.getMinutes() + expiresOffset );
            break;
        // NOTE: UI has been restricted to Minutes only due to long expiry dates being used.
        // Logic is also being modified do to possible issue.
//        case "Hours":
//            reportExpires.setHours( reportExpires.getHours() + expiresOffset );
//            break;
//        case "Days":
//            reportExpires.setDate( reportExpires.getDate() + expiresOffset );
//            break;
        default:
            // Add nothing, we should never be in this state.
            Console.log( 'Error: Invalid content for the report expiration values.');
            break;
    }

    console.log( 'Modified Date by ' + app_Settings.reportExpiresOffset + ' ' + app_Settings.reportExpiresContext +':' + reportExpires.toISOString() );
    // Return the expiration time.
    return reportExpires;
}

function appGetSymbolPath( symbol )
{
    var path;
    var symbolSplit = symbol.split( '.' );

    if( symbolSplit.length > 3 )
    {
        path = "res/EMS/tier2/BlackBorder/ems_tier2_64/" + symbol + ".png";
    }
    else {
        path = "res/EMS/tier1/BlackBorder/ems_tier1_64/" + symbol + ".png";
    }

    return path;
}

function app_loadMapScript()
{
    if( app_MapScriptState == "NONE" )
    {
        app_MapScriptState = "LOADING";

        // NOTE: The callback is needed, otherwise loading the script will not initialize the internal objects...
        var googleScriptURL = "http://maps.googleapis.com/maps/api/js?key=" + app_GoogleAPIKey + "&sensor=false&callback=app_mapScriptLoaded";

        $.getScript( googleScriptURL, function( data, textStatus, jqxhr ) {
            console.log('Google Maps script has been loaded.');
            app_MapScriptState = "LOADED";
        });
    }
}

function app_mapScriptLoaded()
{
    console.log('Google Maps script has been initialized.');
    app_MapScriptState = "READY";
}