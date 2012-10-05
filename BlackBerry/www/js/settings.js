/**
 * MASAS Mobile - Settings Page
 * Updated: Oct 5, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#settings", "pagebeforecreate", function()
{
    settings_loadSettings();
});

$( document ).delegate("#settings_btnClearReports", "vclick", function(event, ui)
{
    appDeleteReports();
    window.localStorage.removeItem( "Reports" );
});

$( document ).delegate("#settings_btnResetSettings", "vclick", function(event, ui)
{
    // Reset the settings...
    appResetSettingsToDefault();
    appSaveSettingsData();

    // Re-load the settings...
    settings_loadSettings();

    // Refresh the necessary controls...
    $('#settings_vehicleType').selectmenu("refresh");
    $('#settings_reportStatus').selectmenu("refresh");
    $('#settings_reportExpirationContext').selectmenu("refresh");
});

$( document ).delegate("#settings_hubURL", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubKey", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_vehicleID", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_vehicleType", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportStatus", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportExpiration", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_reportExpirationContext", "change", function(event, ui) {
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

    $('#settings_vehicleID').val( app_Settings.vehicleId );
    $('#settings_vehicleType').val( app_Settings.vehicleType );

    $('#settings_reportStatus').val( app_Settings.reportStatus );
    $('#settings_reportExpiration').val( app_Settings.reportExpiresOffset );
    $('#settings_reportExpirationContext').val( app_Settings.reportExpiresContext );
    $('#settings_reportCheckIn').val( app_Settings.reportCheckIn );
    $('#settings_reportCheckOut').val( app_Settings.reportCheckOut );
}

function settings_saveSettings()
{
    app_Settings.url = $('#settings_hubURL').val();
    app_Settings.token = $('#settings_hubKey').val();

    app_Settings.vehicleId = $('#settings_vehicleID').val();
    app_Settings.vehicleType = $('#settings_vehicleType').val();

    app_Settings.reportStatus = $('#settings_reportStatus').val();
    app_Settings.reportExpiresOffset = $('#settings_reportExpiration').val();
    app_Settings.reportExpiresContext = $('#settings_reportExpirationContext').val();
    app_Settings.reportCheckIn = $('#settings_reportCheckIn').val();
    app_Settings.reportCheckOut = $('#settings_reportCheckOut').val();

    appSaveSettingsData();
}