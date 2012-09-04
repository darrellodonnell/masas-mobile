var frmReport_isReadOnly = true;

$( document ).delegate("#FormReport", "pagebeforecreate", function()
{
	var isNewReport = false;
	
	if( currentReport == null )
	{
		isNewReport = true;
		currentReport = new reportObj( 'Untitled Report' );
		localReports.push( currentReport );
	}

	frmReport_isReadOnly = true;
	if( currentReport.State != 'Sent' )
	{
		frmReport_isReadOnly = false;
	}
	
	frmReport_resetList();
	frmReport_loadReport();
	
	if( frmReport_isReadOnly )
	{
		$('#txtReportTitle').attr("readonly", true);
		$('#txtReportDescription').attr("readonly", true);
		$('#txtReportNotes').attr("readonly", true);
		
		$('#frmReport_btnPicture').attr("disabled", true);
		$('#frmReport_btnGPS').attr("disabled", true);
		$('#frmReport_btnSend').attr("disabled", true);
		$('#frmReport_btnDelete').attr("disabled", true);
		
		$('#frmReport_gridModifyReport').hide();
		$('#frmReport_gridReportActions').hide();
	}
	else
	{		
		if( isNewReport == true )
		{
			frmReport_getCurrentPosition();
		}
	}

});

$( document ).delegate("#frmReport_btnPicture", "vclick", function(event, ui)
{
	frmReport_takePicture();
});

$( document ).delegate("#frmReport_btnGPS", "vclick", function(event, ui)
{
	 frmReport_getCurrentPosition();
});

$( document ).delegate("#frmReport_btnBack", "vclick", function(event, ui)
{
	if( !frmReport_isReadOnly )
	{
		frmReport_saveReport();
	}
	
	currentReport = null;
	$.mobile.changePage( "reports.html", {} );
});

$( document ).delegate("#frmReport_btnSend", "vclick", function(event, ui)
{
	var masasEntry = appReportToMASAS( currentReport );
	MASAS_createNewEntry( masasEntry );
	
	currentReport.State = 'Sent';
	frmReport_saveReport();
	
	currentReport = null;
	$.mobile.changePage( "reports.html", {} );
});

function frmReport_resetList()
{
	// Remove all the <li> with containing the 'data-masas-report-attachment' attribute from the list.
	$('#lstReportAttachments').children().remove( 'li[data-masas-report-attachment]' );
	$('#lstReportAttachmentCount').text( 0 );
}

function frmReport_loadReport()
{
	$('#frmReport_headerTitle').text( currentReport.Title );
	$('#txtReportTitle').val( currentReport.Title );
	$('#txtReportDescription').val( currentReport.Description );
	$('#txtReportNotes').val( currentReport.Notes );
	
	for( var i=0; i<currentReport.Attachments.length; i++ )
	{
		frmReport_addListItem( currentReport.Attachments[i] );
	}
	$('#lstReportAttachmentCount').text( currentReport.Attachments.length );
	
	frmReport_updateLocation();
	frmReport_updateTimeStamps();
}

function frmReport_updateTimeStamps()
{
	$('#lblReportCreated').text( currentReport.Created.toDateString() + ' ' + currentReport.Created.toLocaleTimeString() );
	$('#lblReportUpdated').text( currentReport.Updated.toDateString() + ' ' + currentReport.Updated.toLocaleTimeString() );
}

function frmReport_updateLocation()
{
	if( currentReport.Location != undefined )
	{
		$('#frmReport_lblPosition').text( currentReport.Location.latitude + ", " + currentReport.Location.longitude );
	}
	else
	{
		$('#frmReport_lblPosition').text( "N/A" );
	}	
}

function frmReport_saveReport()
{
	if( !frmReport_isReadOnly )
	{
		currentReport.Title = $('#txtReportTitle').val();
		currentReport.Description = $('#txtReportDescription').val();
		currentReport.Notes = $('#txtReportNotes').val();
		currentReport.Updated = new Date();
		
		appSaveData();
	}
}

function frmReport_addListItem( attachment )
{
	var listItem, dataList = document.getElementById( 'lstReportAttachments' );
	
	var splitPath = attachment.Path.split('/');
	
	// Create our list item
	listItem = document.createElement('li');
	listItem.setAttribute( 'data-masas-report-attachment', attachment.Path );
	
	if( attachment.Type == 'Image' )
	{
		listItem.innerHTML = '<a><img src="' + attachment.Path + '" /><h3>' + splitPath[splitPath.length-1] + '</h3><p>' + attachment.Path + '</p></a>';
	}
	else
	{
		listItem.innerHTML = '<a><img src="resources/icon.jpg" /><h3>' + splitPath[splitPath.length-1] + '</h3><p>' + attachment.Path + '</p></a>';
	}

	// Append the item
	dataList.appendChild( listItem );
	
	if( !frmReport_isReadOnly ) {
		currentReport.Updated = new Date();
	}
	frmReport_updateTimeStamps();
}

function frmReport_takePicture()
{
	try
	{
		navigator.camera.getPicture(frmReport_onGetPictureSuccess, frmReport_onGetPictureFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
	}
	catch(err)
	{
		alert('Failed because: ' + err);
		frmReport_onGetPictureSuccess('oops.jpg');
	}
}

function frmReport_onGetPictureSuccess(imageURI) {
    var attachment = currentReport.AddImage( imageURI );
	frmReport_addListItem( attachment );
	$('#lstReportAttachments').listview('refresh');
	$('#lstReportAttachmentCount').text( currentReport.Attachments.length );

	frmReport_saveReport();
}

function frmReport_onGetPictureFail(message) {
    alert('Failed because: ' + message);
}

function viewPicture( path ) {
	currentImage = path;
	$.mobile.changePage( "frmShowImage.html" );
}

function frmReport_getCurrentPosition() {
	var gpsOptions = { maximumAge: 5000, timeout: 1000, enableHighAccuracy: true };
	
	$('#frmReport_lblPosition').text( 'Waiting for location...' );
	navigator.geolocation.getCurrentPosition(frmReport_onGetCurPosSuccess, frmReport_onGetCurPosFail, gpsOptions);
}

function frmReport_onGetCurPosSuccess( position ) {
	currentReport.Location = position.coords;
	frmReport_updateLocation();
	frmReport_saveReport();
}

function frmReport_onGetCurPosFail(message) {
	$('#frmReport_lblPosition').text( 'N/A' );

	frmReport_updateLocation();
}