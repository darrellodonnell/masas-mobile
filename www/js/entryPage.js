/**
 * MASAS Mobile - Entry Page
 * Updated: Dec 04, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

/// Global Variables

var entryPage_currentEntryModel = null;

/// EVENTS - Page events

$( document ).delegate("#EntryPage", "pagebeforecreate", function()
{
    var isNewEntry = false;

    if( entryPage_currentEntryModel == null )
    {
        isNewEntry = true;

        entryPage_currentEntryModel = mmApp.entryManager.CreateModel();
        entryPage_currentEntryModel.masasEntry.expires = app_GetReportExpiration();

        mmApp.entryManager.AddEntry( entryPage_currentEntryModel );
    }

    entryPage_loadEntry();

    if( isNewEntry == true )
    {
        entryPage_getCurrentPosition();
    }

    if( entryPage_currentEntryModel.state == MASASMobile.EntryStateEnum.published )
    {
        // Disable modification of the attachements for now!
        $("#entryPage_contentPanelAttachments").addClass('ui-disabled');
    }
});

$( document ).delegate("#EntryPage", "pagebeforeshow", function()
{
    entryPage_updateLookupLocation();
    app_onCoverageChange();
});

/// EVENTS - vclick

$( document ).delegate( "#entryPage_navContent", "vclick", function( event )
{
    $( "#entryPage_contentPanelContent" ).show();
    $( "#entryPage_contentPanelDetails" ).hide();
    $( "#entryPage_contentPanelAttachments" ).hide();
    $( "#entryPage_contentPanelLocation" ).hide();
});

$( document ).delegate( "#entryPage_navDetails", "vclick", function( event )
{
    $( "#entryPage_contentPanelContent" ).hide();
    $( "#entryPage_contentPanelDetails" ).show();
    $( "#entryPage_contentPanelAttachments" ).hide();
    $( "#entryPage_contentPanelLocation" ).hide();
});

$( document ).delegate( "#entryPage_navAttachments", "vclick", function( event )
{
    $( "#entryPage_contentPanelContent" ).hide();
    $( "#entryPage_contentPanelDetails" ).hide();
    $( "#entryPage_contentPanelAttachments" ).show();
    $( "#entryPage_contentPanelLocation" ).hide();
});

$( document ).delegate( "#entryPage_navLocation", "vclick", function( event )
{
    $( "#entryPage_contentPanelContent" ).hide();
    $( "#entryPage_contentPanelDetails" ).hide();
    $( "#entryPage_contentPanelAttachments" ).hide();
    $( "#entryPage_contentPanelLocation" ).show();
});

$( document ).delegate("#entryPage_btnPicture", "vclick", function(event, ui)
{
    entryPage_takePicture();
});

$( document ).delegate("#entryPage_btnAudio", "vclick", function(event, ui)
{
    entryPage_recordAudio();
});

$( document ).delegate("#entryPage_btnGPS", "vclick", function(event, ui)
{
     entryPage_getCurrentPosition();
});

$( document ).delegate("#entryPage_btnBack", "vclick", function(event, ui)
{
    entryPage_saveEntry();
    entryPage_currentEntryModel = null;

    $.mobile.changePage( "viewMASAS.html", {} );
});

$( document ).delegate("#entryPage_btnSend", "vclick", function(event, ui)
{
    if( app_hasDataCoverage() )
    {
        entryPage_enableControls( false );
        entryPage_saveEntry();

        $.mobile.showPageLoadingMsg( "a", "Sending Entry to MASAS..." );
        //app_SendEntryToMASAS( entryPage_currentEntryModel.masasEntry, entryPage_entrySendSuccess, entryPage_entrySendFail );
        mmApp.masasPublisher.PublishEntry( entryPage_currentEntryModel, entryPage_entrySendSuccess, entryPage_entrySendFail );
    }
    else
    {
        alert( "Data coverage in unavailable! Please try again later.");
    }
});

$( document ).delegate("#entryPage_btnDeleteEntry", "vclick", function(event, ui)
{
    mmApp.entryManager.RemoveEntry( entryPage_currentEntryModel );
    entryPage_currentEntryModel = null;
    // NOTE: When the popup closes (event: popupafterclose), it will check for the null value
    //       of entryPage_currentEntryModel.  Depending on the value, the page will return to
    //       the previous page.
});

$( document ).delegate( "#entryPage_attachments li[data-masas-entry-attachment]", "vclick", function( event )
{
    var jsonStr = $(this).attr( 'data-masas-entry-attachment' );

    if( jsonStr != undefined )
    {
        var attachment = JSON.parse( jsonStr.replace(/'/g, '"') );

        if( attachment != null )
        {
            entryPage_viewAttachment( attachment );
        }
    }
});

/// EVENTS - Change

$( document).delegate("#entryPage_txtTitle", "change", function( event, ui )
{
    entryPage_saveEntry();
    entryPage_updateHeader();
});

$( document).delegate("#entryPage_txtDescription", "change", function( event, ui )
{
    entryPage_saveEntry();
});

$( document).delegate("#entryPage_choiceSymbol", "change", function( event, ui )
{
    entryPage_updateSymbol( $("#entryPage_choiceSymbol").val() );
    entryPage_saveEntry();
});

/// EVENTS - Popup events

$( document ).delegate("#viewMASAS_popupDeleteEntry", "popupafterclose", function(event, ui)
{
    if( entryPage_currentEntryModel == null ) {
        // The Entry was deleted, go back to the view page...
        $.mobile.changePage( "viewMASAS.html", {} );
    }
});

/// EntryPage - Methods

function entryPage_enableControls( enable )
{
    if( enable )
    {
        $('#EntryPage').removeClass('ui-disabled');
    }
    else
    {
        $('#EntryPage').addClass('ui-disabled');
    }
}

function entryPage_entrySendSuccess( result )
{
    console.log( 'Entry has been sent!' );
    entryPage_currentEntryModel.state = MASASMobile.EntryStateEnum.published;
    entryPage_saveEntry();

    entryPage_currentEntryModel = null;

    entryPage_enableControls( true );

    $.mobile.hidePageLoadingMsg();
    $.mobile.changePage( "viewMASAS.html", {} );
}

function entryPage_entrySendFail( errorMsg )
{
    console.log( 'Entry could not be sent!' );
    console.log( errorMsg );

    // Enable the controls...
    entryPage_enableControls( true );

    // Hide the loading msg...
    $.mobile.hidePageLoadingMsg();

    // Alert the user about the error...
    alert( errorMsg );
}

function entryPage_resetList()
{
    // Remove all the <li> with containing the 'data-masas-entry-attachment' attribute from the list.
    $('#entryPage_attachments').children().remove( 'li[data-masas-entry-attachment]' );
    $('#entryPage_attachmentCount').text( 0 );
}

function entryPage_updateTimeStamps()
{
    var masasEntry = entryPage_currentEntryModel.masasEntry;

    $('#entryPage_lblPublished').text( "N/A" );
    $('#entryPage_lblUpdated').text( "N/A" );

    if( masasEntry.published != undefined )
    {
        $('#entryPage_lblPublished').text( masasEntry.published.toDateString() + ' ' + masasEntry.published.toLocaleTimeString() );
    }

    if( masasEntry.updated != undefined )
    {
        $('#entryPage_lblUpdated').text( masasEntry.updated.toDateString() + ' ' + masasEntry.updated.toLocaleTimeString() );
    }
}

function entryPage_updateLocation()
{
    if( entryPage_currentEntryModel.location != undefined )
    {
        $('#entryPage_lblPosition').text( entryPage_currentEntryModel.location.latitude + ", " + entryPage_currentEntryModel.location.longitude );
    }
    else
    {
        $('#entryPage_lblPosition').text( "N/A" );
    }
}

function entryPage_updateLookupLocation()
{
    if( location_latitude != undefined && location_longitude != undefined )
    {
        $('#entryPage_lblLookupPosition').text( location_latitude + ", " + location_longitude );
        $('#entryPage_lblLookupPositionDesc').text( location_selectedlookup );
    }
    else
    {
        $('#entryPage_lblLookupPosition').text( "N/A" );
        $('#entryPage_lblLookupPositionDesc').text( "" );
    }
}

function entryPage_updateSymbol( symbol )
{
    $("#entryPage_symbol").attr("src", app_GetSymbolPath( symbol ) );
}

function entryPage_updateHeader()
{
    $('#entryPage_headerTitle').text( entryPage_currentEntryModel.masasEntry.GetTitle() );
}

function entryPage_loadEntry()
{
    var masasEntry = entryPage_currentEntryModel.masasEntry;

    entryPage_resetList();
    entryPage_updateHeader();

    $('#entryPage_txtTitle').val( masasEntry.GetTitle() );
    $('#entryPage_txtContent').val( masasEntry.GetContent() );
    $('#entryPage_txtSummary').val( masasEntry.GetSummary() );

    var expires = masasEntry.expires;
    var strExpiresDate = expires.getFullYear() + "-" +
                         ( "0" + ( expires.getMonth() + 1 ) ).slice( -2 ) + "-" +
                         ( "0" + expires.getDate() ).slice( -2 );
    var strExpiresTime = ( "0" + expires.getHours() ).slice( -2 ) + ":" +
                         ( "0" + expires.getMinutes() ).slice( -2 );
    $('#entryPage_dtExpiresDate').val( strExpiresDate );
    $('#entryPage_dtExpiresTime').val( strExpiresTime );

    $("#entryPage_cbStatus").val( masasEntry.status );

    if( masasEntry.severity == undefined ) {
        $("#entryPage_cbSeverity").val( "undefined" );
    }
    else {
        $("#entryPage_cbSeverity").val( masasEntry.severity );
    }

    if( masasEntry.certainty == undefined ) {
        $("#entryPage_cbCertainty").val( "undefined" );
    }
    else {
        $("#entryPage_cbCertainty").val( masasEntry.certainty );
    }

    // Load the categories...
    for( var i = 0; i < masasEntry.categories.length; i++ )
    {
        $("#entryPage_checkCategories input[value='" + masasEntry.categories[i] + "']" ).attr('checked',true);
    }

    // Load the icon...
    $("#entryPage_choiceSymbol").val( masasEntry.icon );
    entryPage_updateSymbol( masasEntry.icon );

    // Load the attachments...
    for( var i=0; i<masasEntry.attachments.length; i++ )
    {
        entryPage_addListItem( masasEntry.attachments[i] );
    }
    $('#entryPage_attachmentCount').text( masasEntry.attachments.length );

    // Set the locations...
    entryPage_updateLookupLocation();
    entryPage_updateLocation();

    // Set the timestamps.
    entryPage_updateTimeStamps();

    // Display the Identifier...
    if( masasEntry.identifier != undefined ) {
        $('#entryPage_lblIdentifier').text( masasEntry.identifier );
    }
    else {
        $('#entryPage_lblIdentifier').text( "N/A" );
    }
}

function entryPage_saveEntry()
{
    var masasEntry = entryPage_currentEntryModel.masasEntry;

    masasEntry.SetTitle( $('#entryPage_txtTitle').val() );
    masasEntry.SetContent( $('#entryPage_txtContent').val() );
    masasEntry.SetSummary( $('#entryPage_txtSummary').val() );

    var strDate = $('#entryPage_dtExpiresDate').val().split("-");
    var strTime = $('#entryPage_dtExpiresTime').val().split(":");
    masasEntry.expires = new Date( strDate[0], strDate[1]-1, strDate[2], strTime[0], strTime[1] );

    masasEntry.status = $('#entryPage_cbStatus').val();

    masasEntry.severity = $('#entryPage_cbSeverity').val();
    if( masasEntry.severity == "undefined" ) {
        masasEntry.severity = undefined;
    }

    masasEntry.certainty = $('#entryPage_cbCertainty').val();
    if( masasEntry.certainty == "undefined" ) {
        masasEntry.certainty = undefined;
    }

    masasEntry.icon = $("#entryPage_choiceSymbol").val();

    var newCategories = [];
    var checkedCategories = $("#entryPage_checkCategories input:checked" );
    for( var i = 0; i < checkedCategories.length; i++ )
    {
        var categoryValue = $(checkedCategories[i]).val();
        newCategories.push( categoryValue );
    }
    masasEntry.categories = newCategories;

    // Geometry...
    masasEntry.geometry = [];
    masasEntry.geometry.push( { type: "point", data: entryPage_currentEntryModel.location.latitude + " " +
                                                     entryPage_currentEntryModel.location.longitude } );

    app_SaveData();
}

function entryPage_addListItem( attachment )
{
    var listItem, dataList = document.getElementById( 'entryPage_attachments' );

    var splitPath = attachment.uri.split('/');

    // Create our list item
    listItem = document.createElement('li');
    listItem.setAttribute( 'data-masas-entry-attachment', JSON.stringify( attachment ).replace( /"/g, "'" ) );

    var itemHTML  = '<a>';
    if( attachment.contentType.indexOf( 'image' ) != -1 )
    {
        itemHTML  += '<img src="' + attachment.uri + '" />';
    }
    else if( attachment.contentType.indexOf( 'audio' ) != -1 )
    {
        itemHTML  += '<img src="res/icon/MASAS-Mobile_icon.png" />';
    }
    else
    {
        itemHTML  += '<img src="res/icon/MASAS-Mobile_icon.png" />';
    }

    itemHTML += '<h3>' + splitPath[splitPath.length-1] + '</h3>';
    itemHTML += '<p>' + attachment.uri + '</p>'
    itemHTML += '</a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}

// TODO: Consolidate the "takePicture" methods to one central call...
function entryPage_takePicture()
{
    try
    {
        if( app_isDevicePlayBook() )
        {
            // NOTE: This can be removed once the issue with the camera application not always invoking is resolved.
            blackberry.media.camera.takePicture( entryPage_onGetPictureSuccess, entryPage_onCameraClosed, entryPage_onGetPictureFail );
        }
        else
        {
            navigator.camera.getPicture( entryPage_onGetPictureSuccess, entryPage_onGetPictureFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI } );
        }
    }
    catch(err)
    {
        alert( 'Capture failed: ' + err );
    }
}

function entryPage_onGetPictureSuccess( imageURI )
{
    var attachment = new MASAS.Attachment();
    attachment.uri          = imageURI;
    attachment.contentType  = "image/jpeg";
    attachment.title        = attachment.uri.replace( /^.*[\\\/]/, '' );
    attachment.length       = undefined;

    entryPage_currentEntryModel.masasEntry.AddAttachment( attachment );
    entryPage_addListItem( attachment );

    $('#entryPage_attachments').listview('refresh');
    $('#entryPage_attachmentCount').text( entryPage_currentEntryModel.masasEntry.attachments.length );

    entryPage_saveEntry();
}

function entryPage_onGetPictureFail(message)
{
    alert('Failed because: ' + message);
}

function entryPage_onCameraClosed()
{
}

function entryPage_viewAttachment( attachment )
{
    // TODO: Implement entryPage_viewAttachment()...
//    viewAttachment_currentAttachment = attachment;
//    $.mobile.changePage( "viewAttachment.html" );
}

function entryPage_getCurrentPosition()
{
    var gpsOptions = { maximumAge: 0, timeout: 10000, enableHighAccuracy: true };

    $('#entryPage_lblPosition').text( 'Waiting for location...' );
    navigator.geolocation.getCurrentPosition( entryPage_onGetCurPosSuccess, entryPage_onGetCurPosFail, gpsOptions );
}

function entryPage_onGetCurPosSuccess( position )
{
    if( position != null )
    {
        entryPage_currentEntryModel.location = position.coords;
        entryPage_updateLocation();
        entryPage_saveEntry();
    }
}

function entryPage_onGetCurPosFail( message ) {
    $('#entryPage_lblPosition').text( 'N/A' );

    entryPage_updateLocation();
}

// TODO: Consolidate the "recordAudio" methods to one central call...
function entryPage_recordAudio()
{
    navigator.device.capture.captureAudio( entryPage_onRecordAudioSuccess, entryPage_onRecordAudioFail, { limit: 1 } );
}

function entryPage_onRecordAudioSuccess( mediaFiles )
{
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1)
    {
        var attachment = new MASAS.Attachment();
        attachment.uri          = mediaFiles[i].fullPath;
        attachment.contentType  =  mediaFiles[i].type;
        attachment.title        = attachment.uri.replace( /^.*[\\\/]/, '' );
        attachment.length       = undefined;

        entryPage_currentEntryModel.masasEntry.AddAttachment( mediaFiles[i].type, mediaFiles[i].fullPath );
        entryPage_addListItem( attachment );
    }

    $('#entryPage_attachments').listview('refresh');
    $('#entryPage_attachmentCount').text( entryPage_currentEntryModel.masasEntry.Attachments.length );

    entryPage_saveEntry();
}

function entryPage_onRecordAudioFail( error )
{
    alert('Failed because: ' + error);
}