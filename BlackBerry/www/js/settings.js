
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
	window.localStorage.removeItem( "Settings" );	
	app_Settings = { url: '', token: '' };
});

$( document ).delegate("#settings_hubURL", "change", function(event, ui) {
    settings_saveSettings();
});

$( document ).delegate("#settings_hubKey", "change", function(event, ui) {
    settings_saveSettings();
});

function settings_loadSettings()
{
	$('#settings_hubURL').val( app_Settings.url );
	$('#settings_hubKey').val( app_Settings.token );
}

function settings_saveSettings()
{
	app_Settings.url = $('#settings_hubURL').val();
	app_Settings.token = $('#settings_hubKey').val();
	
	appSaveSettingsData();
}