//var nextReportIdentifier = 0;
var localReports = [];
var currentReport = null;
var currentImage = null;
var app_DefaultLocation = { "latitude": 42.999444, "longitude": -82.308889 };

$(document).on("mobileinit", function(){
	$.mobile.defaultPageTransition = 'none';
	$.mobile.defaultDialogTransition = 'none';
	$.mobile.allowCrossDomainPages = true;
	appLoadData();
});

// blackberry.system.event.onHardwareKey( blackberry.system.event.KEY_BACK,
// function() {
   // history.back();
   // return false;
// });

function appLoadData()
{
	var storage = window.localStorage;
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
	var value = JSON.stringify( localReports );
	storage.setItem( "Reports", value );
}

function appLocalReports_deleteReport( report )
{
	for( var i=0; i<localReports.length; i++ )
	{
		if( report === localReports[i] )
		{
			localReports.splice( i, 1 );
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
			"content":	report.Notes,
			"status":	reportStatus,
			"icon":		reportIcon,
			"expires":	reportExpires,
			
		};
	
	if( report.Location != undefined && report.Location != null )
	{
		masasEntry.point = {
				"latitude":		report.Location.latitude,
				"longitude":	report.Location.longitude,
			}
	}
	else {
		masasEntry.point = app_DefaultLocation;
	}
	
	return masasEntry;
}

function appReportToMASAS( report )
{
	var reportStatus = "Test";
	var reportIcon = "other";
	var reportExpires = new Date();
	reportExpires.setHours( reportExpires.getHours() + 1 );
	
	var masasEntry =
		{	
			"title":		report.Title,
			"content":		report.Description,
			"summary":		report.Notes,
			"status":		reportStatus,
			"icon":			reportIcon,
			"expires":		reportExpires,
			"attachments":	report.Attachments,
		};
	
	if( report.Location != undefined && report.Location != null )
	{
		masasEntry.point = {
				"latitude":		report.Location.latitude,
				"longitude":	report.Location.longitude,
			}
	}
	else {
		masasEntry.point = app_DefaultLocation;
	}
	
	return masasEntry;
}

Date.prototype.toJSON = function (key) {
	return this.toISOString();
	// function f(n) {
		// // Format integers to have at least two digits.
		// return n < 10 ? '0' + n : n;
	// }

	// return this.getUTCFullYear()   + '-' +
		 // f(this.getUTCMonth() + 1) + '-' +
		 // f(this.getUTCDate())      + 'T' +
		 // f(this.getUTCHours())     + ':' +
		 // f(this.getUTCMinutes())   + ':' +
		 // f(this.getUTCSeconds())   + 'Z';
};
