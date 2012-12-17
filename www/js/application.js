/**
 * MASAS Mobile - Application Core
 * Updated: Dec 17, 2012
 * Independent Joint Copyright (c) 2011-2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASASMobile = MASASMobile || {};

var mmApp = function() {
    this.masasHub = undefined;
    this.entryManager = undefined;
    this.masasPublisher = undefined;

    this.activeShortReport = undefined;
};

var bb = {
    device: {
        isHighRes: false,
        isBB5: false,
        isBB6: false,
        isBB7: false,
        isBB10: false,
        isPlayBook: false
    }
};

var iOS = {
    device: {
        RetinaDisplay: false,
        iPad: false,
        iPhone: false
    }
};

var app = {
    showAlert: false,
    authorEmail: "",
    description: "",
    copyright: "",
    version: "",
    authorURL: "",
    map: {
        token: ""
    }
};

var app_CordovaLoaded = false;
var localReports = [];

var app_Settings = null;

var currentReport = null;
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
});

$(document).ready( function()
{
    // Init the application...
    app_initApplication();

    // Add a listener on the "deviceready" event to know when Cordova is loaded.
    document.addEventListener( "deviceready", app_onDeviceReady, false );
});

$(window).bind( "orientationchange", function( e )
{
    if( $.mobile.activePage.attr( "id" ) == "viewMASAS" )
    {
        viewMASAS_resizePage();
    }
});

function app_onDeviceReady()
{
    // Cordova is loaded...
    console.log( "Cordova - Device Ready!");
    app_CordovaLoaded = true;

    // Attach to the data coverage events...
    if( app_isDeviceBB567() )
    {
        blackberry.system.event.onCoverageChange( app_onCoverageChange );
    }
    else
    {
        document.addEventListener("online", app_onDeviceOnline, false);
        document.addEventListener("offline", app_onDeviceOffline, false);
    }

    // Attach to the "Back" button event...
    if( app_isDeviceBB567() )
    {
        blackberry.system.event.onHardwareKey( blackberry.system.event.KEY_BACK, app_onBackKey );
    }
    else
    {
        document.addEventListener( "backbutton", app_onBackKey, false );
    }

    // Attach to the "Resume" event...
    if( app_isDeviceBB567() || app_isDevicePlayBook() )
    {
        blackberry.app.event.onForeground( app_onResume );
    }
    else
    {
        document.addEventListener( "resume", app_onResume, false );
    }

    // Attach to the BlackBerry "SwipeDown" event (not supported in Cordova)...
    if( app_isDevicePlayBook() )
    {
        blackberry.app.event.onSwipeDown( app_onSwipeDown );
    }

    // Verify the data coverage...
    app_onCoverageChange();
}

function app_initApplication()
{
    if( !app_IsAppInitialized )
    {
        // Initialize the app...
        mmApp.masasHub = new MASAS.Hub();
        mmApp.entryManager = new MASASMobile.EntryManager();
        mmApp.masasPublisher = new MASASMobile.MASASPublisher();

        // Get the device information...
        app_getDeviceInfo();

        // Load the menu...
        menu_initMenu();

        // Load the application meta data
        app_loadMetaData();

        // Load the application data...
        app_loadData();

        // Enable Maps Support if needed.
        // NOTE: The application Metadata contains the keys/token needed for mapping support!
        if( !app_isDeviceBB567() )
        {
            app_IsMapSupported = true;
            app_loadMapScript();
        }

        app_IsAppInitialized = true;
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

    // iOS checks...
    iOS.device.iPad = ( navigator.userAgent.indexOf( 'iPad' ) >= 0 );
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

function app_isDeviceBlackBerry()
{
    return ( app_isDeviceBB567() || app_isDevicePlayBook() || app_isDeviceBB10() );
}

function app_onBackKey()
{
    console.log( "Event: Back Button");

    if( $.mobile.activePage.attr( "id" ) == "Main" )
    {
        navigator.app.exitApp();
    }
    else
    {
        if( app_isDeviceBB567() )
        {
            // NOTE: history.back() doesn't work with the Cordova event, but is fine with the BlackBerry native event.
            //       Also, the navigator.app.backHistory() doesn't work with jQuery on the BlackBerry.
            history.back();
            return false;
        }
        else
        {
            navigator.app.backHistory();
        }
    }
}

function app_onDeviceOnline()
{
    console.log( "Event: Online");

    app_onCoverageChange();
}

function app_onDeviceOffline()
{
    console.log( "Event: Offline");

    app_onCoverageChange();
}

function app_onCoverageChange()
{
    if( app_CordovaLoaded )
    {
        console.log( "Event: Coverage Change");
    }

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

    if( app_isDeviceBlackBerry() )
    {
        hasDataCoverage = blackberry.system.hasDataCoverage();
    }
    else
    {
        if( app_CordovaLoaded )
        {
            var networkState = navigator.connection.type;
            hasDataCoverage = !( networkState == 'none' );
        }
    }

    return hasDataCoverage;
}

function app_onResume()
{
    console.log( "Event: Resume");

    // update the coverage icon if needed...
    app_onCoverageChange();
}

function app_onSwipeDown()
{
    console.log( "Event: Swipe Down");

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
        reportCheckIn: "On Scene",
        reportCheckOut: "Leaving Scene",
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

function app_loadMetaData()
{
    // Load the meta data from the MASAS-Mobile.json file...
    jQuery.ajax( {
            url: "MASAS-Mobile.json",
            async: false // Wait for this call to be done before moving on!
        }
    ).done( function( msg ) {
            // TODO: Investigate why iOS "isn't returning anything for msg".
            if( msg.MASAS_Mobile ) //DEO - added test for defined variable here - iOS isn't returning anything for msg.
            {
                app = msg.MASAS_Mobile;
            }
        });

    // Overwrite some info we are on the BlackBerry platform...
    if( app_isDeviceBlackBerry() )
    {
        // Load the meta data directly from the BlackBerry API.
        // The data is provided in the config.xml
        app.authorEmail = blackberry.app.authorEmail;
        app.description = blackberry.app.description;
        app.copyright   = blackberry.app.copyright;
        app.version     = blackberry.app.version;
        app.authorURL   = blackberry.app.authorURL;
    }

    if( app.showAlert ) {
        alert( "IMPORTANT: Please modify the METADATA found in MASAS-Mobile.json!");
    }
}

function app_loadData()
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

function app_SaveData()
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

function app_GetSimpleReportIcon()
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

    return returnVal;
}

function app_GetReportExpiration()
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

function app_GetSymbolPath( symbol )
{
    var path;
    var symbolSplit = [];

    if( symbol == undefined || symbol == "other" ) {
        symbol = "ems.other.other";
    }

    symbolSplit = symbol.split( '.' );

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
        var googleScriptURL = "http://maps.googleapis.com/maps/api/js?key=" + app.map.token + "&sensor=false&callback=app_mapScriptLoaded";

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