var report_isReadOnly = true;

$( document ).delegate("#Report", "pagebeforecreate", function()
{
    var isNewReport = false;

    if( currentReport == null )
    {
        isNewReport = true;
        currentReport = new reportObj( 'Untitled Report' );
        localReports.push( currentReport );
    }

    report_isReadOnly = true;
    if( currentReport.State != 'Sent' )
    {
        report_isReadOnly = false;
    }

    report_resetList();
    report_loadReport();

    if( report_isReadOnly )
    {
        $('#txtReportTitle').attr("readonly", true);
        $('#txtReportDescription').attr("readonly", true);

        $('#report_btnGPS').remove();
        $('#report_btnPicture').parent().remove();
        $('#report_btnAudio').parent().remove();
        $('#report_btnSend').parent().remove();
        $('#report_btnDelete').parent().remove();
    }
    else
    {
        if( isNewReport == true )
        {
            report_getCurrentPosition();
        }
    }

});

$( document ).delegate("#report_btnPicture", "vclick", function(event, ui)
{
    report_takePicture();
});

$( document ).delegate("#report_btnAudio", "vclick", function(event, ui)
{
    report_recordAudio();
});

$( document ).delegate("#report_btnGPS", "vclick", function(event, ui)
{
     report_getCurrentPosition();
});

$( document ).delegate("#report_btnBack", "vclick", function(event, ui)
{
    if( !report_isReadOnly )
    {
        report_saveReport();
    }

    currentReport = null;
    $.mobile.changePage( "viewReports.html", {} );
});

$( document ).delegate("#report_btnSend", "vclick", function(event, ui)
{
    $( '#report_btnSend' ).attr( "disabled", true );
    report_saveReport();

    $.mobile.showPageLoadingMsg( "a", "Sending Report to MASAS..." );
    appSendReportToMASAS( currentReport, report_reportSendSuccess, report_reportSendFail );
});

function report_reportSendSuccess()
{
    console.log( 'Report has been sent!' );
    currentReport.State = 'Sent';
    report_saveReport();
    currentReport = null;

    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage( "viewReports.html", {} );
}

function report_reportSendFail()
{
    console.log( 'Report could not be sent!' );
    $.mobile.hidePageLoadingMsg();
}

function report_resetList()
{
    // Remove all the <li> with containing the 'data-masas-report-attachment' attribute from the list.
    $('#lstReportAttachments').children().remove( 'li[data-masas-report-attachment]' );
    $('#lstReportAttachmentCount').text( 0 );
}

function report_loadReport()
{
    $('#report_headerTitle').text( 'Report: ' + currentReport.Title );
    $('#txtReportTitle').val( currentReport.Title );
    $('#txtReportDescription').val( currentReport.Description );

    for( var i=0; i<currentReport.Attachments.length; i++ )
    {
        report_addListItem( currentReport.Attachments[i] );
    }
    $('#lstReportAttachmentCount').text( currentReport.Attachments.length );

    report_updateLocation();
    report_updateTimeStamps();
}

function report_updateTimeStamps()
{
    $('#lblReportCreated').text( currentReport.Created.toDateString() + ' ' + currentReport.Created.toLocaleTimeString() );
    $('#lblReportUpdated').text( currentReport.Updated.toDateString() + ' ' + currentReport.Updated.toLocaleTimeString() );
}

function report_updateLocation()
{
    if( currentReport.Location != undefined )
    {
        $('#report_lblPosition').text( currentReport.Location.latitude + ", " + currentReport.Location.longitude );
    }
    else
    {
        $('#report_lblPosition').text( "N/A" );
    }
}

function report_saveReport()
{
    if( !report_isReadOnly )
    {
        currentReport.Title = $('#txtReportTitle').val();
        currentReport.Description = $('#txtReportDescription').val();
        currentReport.Updated = new Date();

        appSaveData();
    }
}

function report_addListItem( attachment )
{
    var listItem, dataList = document.getElementById( 'lstReportAttachments' );

    var splitPath = attachment.Path.split('/');

    // Create our list item
    listItem = document.createElement('li');
    listItem.setAttribute( 'data-masas-report-attachment', JSON.stringify( attachment ).replace( /"/g, "'" ) );

    var itemHTML  = '<a>';
    if( attachment.Type.indexOf( 'image' ) != -1 )
    {
        itemHTML  += '<img src="' + attachment.Path + '" />';
    }
    else if( attachment.Type.indexOf( 'audio' ) != -1 )
    {
        itemHTML  += '<img src="res/icon/icon.jpg" />';
    }
    else
    {
        itemHTML  += '<img src="res/icon/icon.jpg" />';
    }

    itemHTML += '<h3>' + splitPath[splitPath.length-1] + '</h3>';
    itemHTML += '<p>' + attachment.Path + '</p>'
    itemHTML += '</a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );

    if( !report_isReadOnly ) {
        currentReport.Updated = new Date();
    }
    report_updateTimeStamps();
}

function report_takePicture()
{
    try
    {
        navigator.camera.getPicture(report_onGetPictureSuccess, report_onGetPictureFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
    }
    catch(err)
    {
        alert('Capture failed: ' + err);
    }
}

function report_onGetPictureSuccess(imageURI) {
    var attachment = currentReport.AddAttachment( 'image/jpeg', imageURI );
    report_addListItem( attachment );
    $('#lstReportAttachments').listview('refresh');
    $('#lstReportAttachmentCount').text( currentReport.Attachments.length );

    report_saveReport();
}

function report_onGetPictureFail(message) {
    alert('Failed because: ' + message);
}

function viewAttachment( attachment ) {
    currentAttachment = attachment;
    $.mobile.changePage( "viewAttachment.html" );
}

function report_getCurrentPosition() {
    var gpsOptions = { maximumAge: 5000, timeout: 10000, enableHighAccuracy: true };

    $('#report_lblPosition').text( 'Waiting for location...' );
    navigator.geolocation.getCurrentPosition(report_onGetCurPosSuccess, report_onGetCurPosFail, gpsOptions);
}

function report_onGetCurPosSuccess( position ) {
    currentReport.Location = position.coords;
    report_updateLocation();
    report_saveReport();
}

function report_onGetCurPosFail(message) {
    $('#report_lblPosition').text( 'N/A' );

    report_updateLocation();
}

function report_recordAudio()
{
    navigator.device.capture.captureAudio(report_onRecordAudioSuccess, report_onRecordAudioFail, {limit: 1});
}

function report_onRecordAudioSuccess( mediaFiles ) {
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1)
    {
        var attachment = currentReport.AddAttachment( mediaFiles[i].type, mediaFiles[i].fullPath );
        report_addListItem( attachment );
    }

    $('#lstReportAttachments').listview('refresh');
    $('#lstReportAttachmentCount').text( currentReport.Attachments.length );

    report_saveReport();
}

function report_onRecordAudioFail( error ) {
    alert('Failed because: ' + error);
}