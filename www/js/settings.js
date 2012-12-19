/**
 * MASAS Mobile - Settings Page
 * Updated: Dec 19, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#settings", "pagebeforecreate", function()
{
    // Hide the viewMASAS button if needed...
    if( app_isDeviceBB567() )
    {
        $( "#mainNav_viewMASAS" ).parent().remove();
        $( "#settings_mapPanel" ).hide();
    }

    settings_loadSettings();
});

$( document ).delegate("#settings_btnClearReports", "vclick", function(event, ui)
{
    appDeleteReports();
    window.localStorage.removeItem( "Reports" );

    mmApp.activeShortReport = undefined;
    window.localStorage.removeItem( "QuickReport" );
});

$( document ).delegate("#settings_btnResetSettings", "vclick", function(event, ui)
{
    // Reset the settings...
    app_ResetSettingsToDefault();
    appSaveSettingsData();

    // Re-load the settings...
    settings_loadSettings();

    // Refresh the necessary controls...
    $('#settings_hubFilterEnabled').slider("refresh");
    $('#settings_vehicleType').selectmenu("refresh");
    $('#settings_reportStatus').selectmenu("refresh");
});

$( document ).delegate("#settings_hubURL", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubKey", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubFilterEnabled", "change", function(event, ui) {
    settings_updateHubFilterEnabled();
    settings_saveSettings();
});

$( document ).delegate("#settings_hubFilterSWLat", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubFilterSWLon", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubFilterNELat", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubFilterNELon", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_vehicleID", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_vehicleType", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_mapDefaultViewLat", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_mapDefaultViewLon", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_mapDefaultViewZoom", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_defaultLocationLat", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_defaultLocationLon", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportStatus", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportExpiration", "change", function(event, ui)
{
    // Make sure the value is within the 1 - 14400 range...
    var value = $('#settings_reportExpiration').val();
    if( value > 14400 ) {
        value = 14400;
    }
    else if( value < 1 ) {
        value = 1;
    }

    $('#settings_reportExpiration').val( value );

    settings_saveSettings();
});

$( document ).delegate("#settings_reportCheckIn", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportCheckOut", "change", function(event, ui) {
    settings_saveSettings();
});

function settings_loadSettings()
{
    $('#settings_hubURL').val( app_Settings.url );
    $('#settings_hubKey').val( app_Settings.token );

    if( app_Settings.hub != undefined )
    {
        var filter = app_Settings.hub.filters[0];
        $('#settings_hubFilterEnabled').val( filter.enable? "yes" : "no" );
        $('#settings_hubFilterSWLat').val( filter.data.swLat );
        $('#settings_hubFilterSWLon').val( filter.data.swLon );
        $('#settings_hubFilterNELat').val( filter.data.neLat );
        $('#settings_hubFilterNELon').val( filter.data.neLon );
    }

    $('#settings_vehicleID').val( app_Settings.vehicleId );
    $('#settings_vehicleType').val( app_Settings.vehicleType );

    if( app_Settings.map != undefined )
    {
        $('#settings_mapDefaultViewLat').val( app_Settings.map.defaultCenter.lat );
        $('#settings_mapDefaultViewLon').val( app_Settings.map.defaultCenter.lon );
        $('#settings_mapDefaultViewZoom').val( app_Settings.map.defaultZoom );
    }

    $('#settings_defaultLocationLat').val( app_Settings.defaultLocation.latitude );
    $('#settings_defaultLocationLon').val( app_Settings.defaultLocation.longitude );
    $('#settings_reportStatus').val( app_Settings.reportStatus );
    $('#settings_reportExpiration').val( app_Settings.reportExpiresOffset );
    $('#settings_reportCheckIn').val( app_Settings.reportCheckIn );
    $('#settings_reportCheckOut').val( app_Settings.reportCheckOut );

    settings_updateHubFilterEnabled();
}

function settings_saveSettings()
{
    app_Settings.url = $('#settings_hubURL').val();
    app_Settings.token = $('#settings_hubKey').val();

    var filter = app_Settings.hub.filters[0];
    filter.enable = ( $('#settings_hubFilterEnabled').val() == "yes" );
    filter.data.swLat = parseFloat( $('#settings_hubFilterSWLat').val() );
    filter.data.swLon = parseFloat( $('#settings_hubFilterSWLon').val() );
    filter.data.neLat = parseFloat( $('#settings_hubFilterNELat').val() );
    filter.data.neLon = parseFloat( $('#settings_hubFilterNELon').val() );

    app_Settings.vehicleId = $('#settings_vehicleID').val();
    app_Settings.vehicleType = $('#settings_vehicleType').val();

    app_Settings.map.defaultCenter.lat = parseFloat( $('#settings_mapDefaultViewLat').val() );
    app_Settings.map.defaultCenter.lon = parseFloat( $('#settings_mapDefaultViewLon').val() );
    app_Settings.map.defaultZoom = parseInt( $('#settings_mapDefaultViewZoom').val(), 10 );

    app_Settings.defaultLocation.latitude = parseFloat( $('#settings_defaultLocationLat').val() );
    app_Settings.defaultLocation.longitude = parseFloat( $('#settings_defaultLocationLon').val() );
    app_Settings.reportStatus = $('#settings_reportStatus').val();
    app_Settings.reportExpiresOffset = parseInt( $('#settings_reportExpiration').val(), 10 );
    app_Settings.reportCheckIn = $('#settings_reportCheckIn').val();
    app_Settings.reportCheckOut = $('#settings_reportCheckOut').val();

    appSaveSettingsData();
}

function settings_updateHubFilterEnabled()
{
    if( $("#settings_hubFilterEnabled" ).val() == "yes" )
    {
        $("#settings_hubFilter" ).show();
    }
    else {
        $("#settings_hubFilter" ).hide();
}
}