//var nextReportIdentifier = 0;
var localReports = [];
var app_Settings = { url: '', token: '' };

var currentReport = null;
var currentAttachment = null;
var app_DefaultLocation = { latitude: 42.999444, longitude: -82.308889 };

$(document).on("mobileinit", function(){
	jQuery.support.cors = true;
	$.mobile.ajaxEnable = false;
    $.mobile.pushStateEnabled = false;
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.allowCrossDomainPages = true;

	appLoadData();
	
	if( window.blackberry && blackberry.system && blackberry.system.event && blackberry.system.event.onHardwareKey )
	{
		blackberry.system.event.onHardwareKey( blackberry.system.event.KEY_BACK, app_onBackKey );
	}

});

function app_onBackKey() {
   history.back();
   return false;
}

Date.prototype.toJSON = function (key) {
	return this.toISOString();
};

function appLoadData()
{
	var storage = window.localStorage;
	
	// Load Hub settings...
	var MASAS_Settings = storage.getItem( "Settings" );
	if( MASAS_Settings == null )
	{
		app_Settings = { url: 'https://sandbox2.masas-sics.ca/hub', token: '12345' };
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
	var reportStatus = "Test";
	var reportIcon = "other";
	var reportExpires = new Date();
	reportExpires.setHours( reportExpires.getHours() + 1 );
	
	var masasEntry =
		{	
			"title":	report.Title,
			"content":	report.Description,
			"status":	reportStatus,
			"icon":		reportIcon,
			"expires":	reportExpires
        };
	
	if( report.Location != undefined && report.Location != null )
	{
		masasEntry.point = {
				"latitude":		report.Location.latitude,
				"longitude":	report.Location.longitude
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
	
	var reportStatus = "Test";
	var reportIcon = "other";
	var reportExpires = new Date();
	reportExpires.setHours( reportExpires.getHours() + 1 );
	
	app_generatedMasasEntry =
		{	
			"title":		report.Title,
			"content":		report.Description,
			"status":		reportStatus,
			"icon":			reportIcon,
			"expires":		reportExpires,
			"attachments":	[]
		};
	
	if( report.Location != undefined && report.Location != null )
	{
		app_generatedMasasEntry.point = {
				"latitude":		report.Location.latitude,
				"longitude":	report.Location.longitude
			}
	}
	else {
		app_generatedMasasEntry.point = app_DefaultLocation;
	}
	
	app_generatedMasasEntry.attachments = [];
	// setup the data up front so we don't have any data access problems...
	for( var i=0; i<report.Attachments.length; i++ )
	{
		var attachment = {
			path: report.Attachments[i].Path,
			fileName: report.Attachments[i].Path.replace(/^.*[\\\/]/, ''),
			contentType: report.Attachments[i].Type,
			description: ''
		}
		app_generatedMasasEntry.attachments.push( attachment );
	}
	
	// Convert each attachment to BASE64
	if( app_generatedMasasEntry.attachments.length > 0 )
	{
		for( var i=0; i< app_generatedMasasEntry.attachments.length; i++ )
		{
			console.log( 'Opening file: ' + report.Attachments[i].Path );

			if( blackberry.io.file.exists(report.Attachments[i].Path) ) {
				blackberry.io.file.readFile(report.Attachments[i].Path,handleOpenedFile);
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

function handleOpenedFile( fullPath, blobData )
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
		attachment.base64 = blackberry.utils.blobToString( blobData, 'BASE64' );
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
