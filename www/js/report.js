/**
 * MASAS Mobile - Full Report Page
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var report_isReadOnly = true;

// The create event is used when the report is loaded with the lists of reports
// and not as a JQM page.
$( document ).delegate("#Report", "create", function()
{
    report_pagebeforecreate();
    report_pagebeforeshow();
} );

$( document ).delegate("#Report", "pagebeforecreate", report_pagebeforecreate );
$( document ).delegate("#Report", "pagebeforeshow", report_pagebeforeshow );

function report_pagebeforecreate()
{
    var isNewReport = false;

    if( currentReport == null )
    {
        isNewReport = true;
        currentReport = new reportObj();
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
        $('#report_txtTitle').attr("readonly", true);
        $('#report_txtDescription').attr("readonly", true);

        $('#report_btnGPS').remove();
        $('#report_btnPicture').parent().remove();
        $('#report_btnAudio').parent().remove();
        $('#report_btnSend').parent().remove();
        $('#report_btnDelete').parent().remove();
        $('#report_btnLocation').parent().remove();
    }
    else
    {
        if( isNewReport == true )
        {
            report_getCurrentPosition();
        }
    }
}

function report_pagebeforeshow()
{
    if( location_latitude != undefined && location_longitude != undefined )
    {
        currentReport.LookupLocation.Location = {
                'latitude': location_latitude,
                'longitude': location_longitude
        }

        currentReport.LookupLocation.Lookup = location_selectedlookup;

        report_updateLookupLocation();
        report_saveReport();
    }

    app_onCoverageChange();
}

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

$( document ).delegate("#report_btnHome", "vclick", function(event, ui)
{
    if( !report_isReadOnly )
    {
        report_saveReport();
    }

    currentReport = null;
    $.mobile.changePage( "index.html", {} );
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
    if( app_hasDataCoverage() )
    {
        report_enableControls( false );
        report_saveReport();

        $.mobile.showPageLoadingMsg( "a", "Sending Report to MASAS..." );

        mmApp.masasPublisher.PublishReport( currentReport, report_reportSendSuccess, report_reportSendFail );
    }
    else
    {
        alert( "Data coverage in unavailable! Please try again later.");
    }
});

$( document).delegate("#report_txtTitle", "change", function( event, ui )
{
    report_saveReport();
});

$( document).delegate("#report_txtDescription", "change", function( event, ui )
{
    report_saveReport();
});

$( document).delegate("#report_choiceSymbol", "change", function( event, ui )
{
    report_updateSymbol( $("#report_choiceSymbol").val() );
    report_saveReport();
});

$( document ).delegate( "li[data-masas-report-attachment]", "vclick", function( event )
{
    var jsonStr = $(this).attr( 'data-masas-report-attachment' );

    if( jsonStr != undefined )
    {
        var attachment = JSON.parse( jsonStr.replace(/'/g, '"') );

        if( attachment != null )
        {
            viewAttachment( attachment );
        }
    }
});

function report_enableControls( enable )
{
    if( enable )
    {
        $('#Report').removeClass( 'ui-disabled' );
    }
    else
    {
        $('#Report').addClass( 'ui-disabled' );
    }
}

function report_reportSendSuccess()
{
    console.log( 'Report has been sent!' );
    currentReport.State = 'Sent';
    report_saveReport();
    currentReport = null;

    report_enableControls( true );
    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage( "viewReports.html", {} );
}

function report_reportSendFail( errorMsg )
{
    console.log( 'Report could not be sent!' );
    console.log( errorMsg );

    // Enable the controls...
    report_enableControls( true );

    // Hide the loading msg...
    $.mobile.hidePageLoadingMsg();

    // Alert the user about the error...
    alert( errorMsg );
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
    $('#report_txtTitle').val( currentReport.Title );
    $('#report_txtDescription').val( currentReport.Description );

    $("#report_choiceSymbol").val( currentReport.Symbol );
    report_updateSymbol( currentReport.Symbol );

    for( var i=0; i<currentReport.Attachments.length; i++ )
    {
        report_addListItem( currentReport.Attachments[i] );
    }
    $('#lstReportAttachmentCount').text( currentReport.Attachments.length );

    // Set the location toggle...
    $('input:radio[value=' + currentReport.UseLocation + ']').attr('checked',true);

    // Set the locations...
    report_updateLookupLocation();
    report_updateLocation();

    // Set the timestamps.
    report_updateTimeStamps();
}

function report_updateTimeStamps()
{
    $('#lblReportCreated').text( currentReport.Created.toDateString() + ' ' + currentReport.Created.toLocaleTimeString() );
    $('#lblReportUpdated').text( currentReport.Updated.toDateString() + ' ' + currentReport.Updated.toLocaleTimeString() );
}

function report_updateLocation()
{
    $('#report_btnGPS').removeClass( "ui-disabled" )

    if( currentReport.Location != undefined )
    {
        $('#report_lblPosition').text( currentReport.Location.latitude + ", " + currentReport.Location.longitude );
    }
    else
    {
        $('#report_lblPosition').text( "N/A" );
    }
}
function report_updateLookupLocation()
{
    if( currentReport.LookupLocation.Location != undefined )
    {
        $('#report_lblLookupPosition').text( currentReport.LookupLocation.Location.latitude + ", " + currentReport.LookupLocation.Location.longitude );
        $('#report_lblLookupPositionDesc').text( currentReport.LookupLocation.Lookup );
    }
    else
    {
        $('#report_lblLookupPosition').text( "N/A" );
        $('#report_lblLookupPositionDesc').text( "" );
    }
}

function report_updateSymbol( symbol )
{
    $("#report_symbol").attr("src", app_GetSymbolPath( symbol ) );
}

function report_saveReport()
{
    if( !report_isReadOnly )
    {
        currentReport.Title = $('#report_txtTitle').val();
        currentReport.Description = $('#report_txtDescription').val();
        currentReport.Symbol = $("#report_choiceSymbol").val();

        currentReport.Updated = new Date();

        currentReport.UseLocation = $('input:radio[name=report_locationChoice]:checked').val();

        app_SaveData();
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
        itemHTML  += '<img src="res/icon/MASAS-Mobile_icon.png" />';
    }
    else
    {
        itemHTML  += '<img src="res/icon/MASAS-Mobile_icon.png" />';
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
        if( app_isDevicePlayBook() )
        {
            // NOTE: This can be removed once the issue with the camera application not always invoking is resolved.
            blackberry.media.camera.takePicture( report_onGetPictureSuccess, report_onCameraClosed, report_onGetPictureFail );
        }
        else
        {
            navigator.camera.getPicture( report_onGetPictureSuccess, report_onGetPictureFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI } );
        }
    }
    catch(err)
    {
        alert( 'Capture failed: ' + err );
    }
}

function report_onGetPictureSuccess(imageURI)
{
    var attachment = currentReport.AddAttachment( 'image/jpeg', imageURI );
    report_addListItem( attachment );
    $('#lstReportAttachments').listview('refresh');
    $('#lstReportAttachmentCount').text( currentReport.Attachments.length );

    report_saveReport();
}

function report_onGetPictureFail(message)
{
    alert('Failed because: ' + message);
}

function report_onCameraClosed()
{
}

function viewAttachment( attachment ) {
    viewAttachment_currentAttachment = attachment;
    $.mobile.changePage( "viewAttachment.html" );
}

function report_getCurrentPosition()
{
    var gpsOptions = { maximumAge: 5000, timeout: 60000*15, enableHighAccuracy: true };

    $('#report_lblPosition').text( 'Waiting for location...' );
    navigator.geolocation.getCurrentPosition(report_onGetCurPosSuccess, report_onGetCurPosFail, gpsOptions);

    $('#report_btnGPS').addClass( "ui-disabled" )
}

function report_onGetCurPosSuccess( position )
{
    if( position != null )
    {
        currentReport.Location = position.coords;
        report_updateLocation();
        report_saveReport();
    }
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