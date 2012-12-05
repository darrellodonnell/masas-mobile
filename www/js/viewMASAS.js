/**
 * MASAS Mobile - View MASAS
 * Updated: Dec 04, 2012
 * Independent Joint Copyright (c) 2011-2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var mapInitialized = false;
var map = null;
var markers = [];
var infoWindow;

$( document ).delegate( "#viewMASAS", "pagebeforecreate", function( event, ui )
{
});

$( document ).delegate( "#viewMASAS", "pageshow", function( event, ui )
{
    viewMASAS_resizePage();

    if( app_IsMapSupported ) {
        viewMASAS_initializeMap();
    }

    viewMASAS_refreshListOfEntries();
});

$( document ).delegate( "#viewMASAS", "pagehide", function( event, ui )
{
    map = null;
    mapInitialized = false;
});

$( document ).delegate( "#viewMASAS", "updatelayout", function( event, ui )
{
    // Reset the Page Padding...
    viewMASAS_resetPagePadding();
});

$( document ).delegate( "#viewMASAS_btnToggleMap", "click", function( event, ui )
{
    if( $("#viewMASAS_entryPanel").is( ":hidden" ) )
    {
        viewMASAS_showEntryPanel();
    }
    else
    {
        viewMASAS_hideEntryPanel();
    }
});

$( document ).delegate( "#viewMASAS_btnRefreshList", "click", function( event, ui )
{
    viewMASAS_refreshListOfEntries();
});

$( document ).delegate( "#viewMASAS_popupText", "popupbeforeposition", function()
{
    var maxHeight = $( window ).height() - 60 + "px";
    var maxWidth = $( window ).width() - 60 + "px";

    $( "#viewMASAS_popupText div" ).css( "max-height", maxHeight );
    $( "#viewMASAS_popupText div" ).css( "max-width", maxWidth );
});

$( document ).delegate( "#viewMASAS_popupPhoto", "popupbeforeposition", function()
{
    var maxHeight = $( window ).height() - 60 + "px";
    var maxWidth = $( window ).width() - 60 + "px";

    $( "#viewMASAS_popupPhoto div" ).css( "max-height", maxHeight );
    $( "#viewMASAS_popupPhoto div" ).css( "max-width", maxWidth );
});

$( document ).delegate( "#viewMASAS_popupPanel", "popupbeforeposition", function()
{
    // Set the popup's height to that of the window...
    var maxHeight = $( window ).height();
    $( "#viewMASAS_popupPanel" ).height( maxHeight );
});

$( document ).delegate( "#viewMASAS_popupPanel", "popupafteropen", function()
{
    viewMASAS_resetPagePadding();
});

$( document ).delegate( "#viewMASAS_popupPanel", "popupafterclose", function()
{
    viewMASAS_resetPagePadding();
});

$( document ).delegate( "#viewMASAS_lstEntries li[data-masas-entry-identifier]", "vclick", function( event )
{
    // Select the item...
    var entryId = $(this).attr( "data-masas-entry-identifier" );

    if( entryId !== undefined )
    {
        var marker = viewMASAS_getViewObjFromIdentifier( entryId );

        viewMASAS_selectListItem( entryId );

        if( marker instanceof google.maps.Marker )
        {
            map.panTo( marker.getPosition() );
        }
        else if( marker instanceof google.maps.Polygon )
        {
            var bounds = new google.maps.LatLngBounds();
            var path = marker.getPath();

            for( var i=0; i<path.length; i++ )
            {
                bounds.extend( path.getAt( i ) );
            }

            map.fitBounds( bounds );
        }
        else if( marker instanceof google.maps.Rectangle )
        {
            map.fitBounds( marker.getBounds() );
        }

        // Entry..
        viewMASAS_updateEntryPanel( entryId );
    }
});

$( document ).delegate( "#viewMASAS_btnDefaultView", "vclick", function( event )
{
    var mapCenter = map.getCenter();

    app_Settings.map.defaultZoom = map.getZoom();
    app_Settings.map.defaultCenter.lat = mapCenter.lat();
    app_Settings.map.defaultCenter.lon = mapCenter.lng();

    appSaveSettingsData();
    viewMASAS_hideMenu();
});

$( document ).delegate( "#viewMASAS_btnAddFilter", "vclick", function( event )
{
    var mapBounds = map.getBounds();
    var llSW = mapBounds.getSouthWest();
    var llNE = mapBounds.getNorthEast();

    app_Settings.hub.filters[0].enable = true;
    app_Settings.hub.filters[0].type = "bbox";
    app_Settings.hub.filters[0].data = { "swLat": llSW.lat(),
                                         "swLon": llSW.lng(),
                                         "neLat": llNE.lat(),
                                         "neLon": llNE.lng() };

    appSaveSettingsData();
    viewMASAS_hideMenu();
});

$( document ).delegate( "#viewMASAS_btnAddEntry", "vclick", function( event )
{
    //viewMASAS_hideMenu();

    // Open the "new" entry page...
    $.mobile.changePage( "entryPage.html", {} );
});

$( document ).delegate( "#viewMASAS_entryNavDetails", "vclick", function( event )
{
    $( "#viewMASAS_entryContentPanelDetails" ).show();
    $( "#viewMASAS_entryContentPanelAttachments" ).hide();
    $( "#viewMASAS_entryContentPanelXML" ).hide();
});

$( document ).delegate( "#viewMASAS_entryNavAttachments", "vclick", function( event )
{
    $( "#viewMASAS_entryContentPanelDetails" ).hide();
    $( "#viewMASAS_entryContentPanelAttachments" ).show();
    $( "#viewMASAS_entryContentPanelXML" ).hide();
});

$( document ).delegate( "#viewMASAS_entryNavXML", "vclick", function( event )
{
    $( "#viewMASAS_entryContentPanelDetails" ).hide();
    $( "#viewMASAS_entryContentPanelAttachments" ).hide();
    $( "#viewMASAS_entryContentPanelXML" ).show();
});


$( document ).delegate( "#viewMASAS_btnEditEntry", "vclick", function( event )
{
    // Get the current selection...
    var selectedEntryId = viewMASAS_getSelectListItemId();
    var selectedEntry = undefined;

    if( selectedEntryId != -1 ) {
        selectedEntry = mmApp.entryManager.GetEntryByIdentifier( selectedEntryId );
    }

    // Open the entryPage if a proper entry is selected...
    if( selectedEntry != undefined && !selectedEntry.IsReadOnly() )
    {
        entryPage_currentEntryModel = selectedEntry;
        $.mobile.changePage( "entryPage.html", {} );
    }

});

$( document ).delegate( "#viewMASAS_btnCancelEntry", "vclick", function( event )
{
    // Get the current selection...
    var selectedEntryId = viewMASAS_getSelectListItemId();
    var selectedEntry = undefined;

    if( selectedEntryId != -1 ) {
        selectedEntry = mmApp.entryManager.GetEntryByIdentifier( selectedEntryId );
    }

    // Open the entryPage if a proper entry is selected...
    if( selectedEntry != undefined && !selectedEntry.IsReadOnly() )
    {
        viewMASAS_enableControls( false );
        $.mobile.showPageLoadingMsg( "a", "Cancelling MASAS Entry..." );
        mmApp.masasPublisher.CancelEntry( selectedEntry, viewMASAS_cancelEntrySuccess, viewMASAS_cancelEntryFailed );
    }

});

function viewMASAS_cancelEntrySuccess()
{
    viewMASAS_hideEntryPanel();
    viewMASAS_refreshListOfEntries();
    viewMASAS_enableControls( true );
    $.mobile.hidePageLoadingMsg();
}

function viewMASAS_cancelEntryFailed( msg )
{
    viewMASAS_enableControls( true );
    $.mobile.hidePageLoadingMsg();
    alert( "Entry could not be cancelled!  Error: " + msg );
}

function viewMASAS_showMenu()
{
    $( "#viewMASAS_popupPanel" ).popup( "open", { transition : 'slide'} );
}

function viewMASAS_hideMenu()
{
    $( "#viewMASAS_popupPanel" ).popup( "close", { transition : 'slide'} );
}

function viewMASAS_addListItem( listId, entryModel )
{
    var symbol = "ems.other.other";
    var listItem;
    var dataList = document.getElementById( listId );

    if( entryModel.masasEntry.icon != undefined ) {
        symbol = entryModel.masasEntry.icon.replace(/\//g, "." );
    }

    // Create our list item
    listItem = document.createElement( "li" );
    listItem.setAttribute( "data-masas-entry-identifier", entryModel.identifier );

    if( entryModel.state == MASASMobile.EntryStateEnum.unpublished )
    {
        listItem.setAttribute( "data-theme", "e" );
    }

    var itemHTML  = '<a>';
    itemHTML += '<div class="report_icon_wrapper">';
    itemHTML += '<img src="' + app_GetSymbolPath( symbol ) + '" style="max-width:48px;max-height:48px;" />';
    itemHTML += '</div>';
    itemHTML += '<h3>' + entryModel.masasEntry.GetTitle() + '</h3>' + '<p>' + entryModel.masasEntry.GetContent() + '</p></a>';
    //itemHTML += '<a href="#" data-icon="grid" data-theme="c"></a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}

function viewMASAS_refreshList()
{
    $("#viewMASAS_lstEntries").listview( "refresh" );
}

function viewMASAS_getSelectListItemId()
{
    var curSelectId = -1;
    var liCurSelect = $( "li[class*='ui-masas-list-item-selected']" );

    if( liCurSelect.length > 0 ) {
        curSelectId = $(liCurSelect).attr( "data-masas-entry-identifier" );
    }

    return curSelectId;
}

function viewMASAS_selectListItem( selectionId )
{
    var liCurSelect = $( "li[class*='ui-masas-list-item-selected']" );
    var curSelectIndex = -1;
    var markerToSelect = viewMASAS_getViewObjFromIdentifier( selectionId );

    // De-select the previous item...
    if( liCurSelect.length > 0 )
    {
        curSelectId = $(liCurSelect).attr( "data-masas-entry-identifier" );
        liCurSelect.removeClass( "ui-masas-list-item-selected" );

        var curSelMarker = viewMASAS_getViewObjFromIdentifier( curSelectId );

        if( curSelMarker instanceof google.maps.Polygon || curSelMarker instanceof google.maps.Rectangle )
        {
            curSelMarker.setVisible( false );
        }

        // Close the InfoWindow
        infoWindow.close();
    }

    var liToSelect = $("li[data-masas-entry-identifier='" + selectionId + "']");
    liToSelect.addClass( "ui-masas-list-item-selected" );

    if( markerToSelect instanceof google.maps.Polygon || markerToSelect instanceof google.maps.Rectangle )
    {
        markerToSelect.setVisible( true );
    }

    viewMASAS_refreshList();
}

function viewMASAS_initializeMap()
{
    if (!mapInitialized)
    {
        var defaultCenter = new google.maps.LatLng( app_Settings.map.defaultCenter.lat, app_Settings.map.defaultCenter.lon );

        var myOptions = {
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            mapTypeControl: true,
            zoom: app_Settings.map.defaultZoom,
            center: defaultCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map( document.getElementById( "map_canvas" ), myOptions );

        infoWindow = new google.maps.InfoWindow( { content: "" });

        mapInitialized = true;
    }
    else {
        google.maps.event.trigger( map, 'resize' );
    }
}

function viewMASAS_refreshListOfEntries()
{
    var options = null;
    var filter = app_Settings.hub.filters[0];

    if( filter.enable )
    {
        options = { 'geoFilter': filter.type + '=' + filter.data.swLon + ',' + filter.data.swLat + ',' + filter.data.neLon + ',' + filter.data.neLat };
    }

    if( mmApp.masasHub.userData == undefined ) {
        mmApp.masasHub.RefreshUserData();
    }

    mmApp.masasHub.GetEntries( options, viewMASAS_getEntriesSuccess, viewMASAS_getEntriesFailure );
}

function viewMASAS_getEntriesSuccess( xmlFeed, entries )
{
    // Clear the existing list...
    viewMASAS_clearListOfEntries();

    if( app_IsMapSupported ) {
        viewMASAS_clearListOfEntriesFromMap();
    }

    mmApp.entryManager.RemovePublishedEntries();
    for( var i = 0; i<entries.length; i++)
    {
        var entry = mmApp.entryManager.CreateModel();
        entry.state = MASASMobile.EntryStateEnum.published;
        entry.masasEntry = entries[i];

        mmApp.entryManager.AddEntry( entry );


    }

    // TODO: Implement proper Observer Pattern...
    for( var i = 0; i < mmApp.entryManager.Count(); i++ )
    {
        viewMASAS_entryManager_EntryAdded( mmApp.entryManager.GetEntry( i ) );
    }

    viewMASAS_refreshList();
}

function viewMASAS_entryManager_EntryAdded( entry )
{
    viewMASAS_addListItem( "viewMASAS_lstEntries", entry );

    if( app_IsMapSupported ) {
        viewMASAS_addMapItem( entry );
    }
}

function viewMASAS_getEntriesFailure()
{

}

function viewMASAS_clearListOfEntries()
{
    // Remove all the <li> from the list.
    $('#viewMASAS_lstEntries').children().remove( 'li' );
}

function viewMASAS_markerClicked( event, data )
{
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // NOTE: these can be multilingual; 'en' is taken by default.
    var title = entryModel.masasEntry.GetTitle();
    var description = entryModel.masasEntry.GetContent();

    viewMASAS_selectListItem( data.identifier );

    infoWindow.setContent( title + " " + description );
    infoWindow.open( map, data.marker );
}

function viewMASAS_polygonClicked( event, data )
{
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // NOTE: these can be multilingual; 'en' is taken by default.
    var title = entryModel.masasEntry.GetTitle();
    var description = entryModel.masasEntry.GetContent();

    viewMASAS_selectListItem( data.identifier );

    infoWindow.setContent( title + " " + description );
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_boxClicked( event, data )
{
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // NOTE: these can be multilingual; 'en' is taken by default.
    var title = entryModel.masasEntry.GetTitle();
    var description = entryModel.masasEntry.GetContent();

    viewMASAS_selectListItem( data.identifier );

    infoWindow.setContent( title + " " + description );
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_addMapItem( entryModel )
{
    var symbol = "ems.other.other";
    var geometry = entryModel.masasEntry.geometry;

    if( entryModel.masasEntry.icon != undefined ) {
        symbol = entryModel.masasEntry.icon.replace(/\//g, "." );
    }

    if( geometry.length == 0 )
    {
        // No geometry is available... show a marker at (0,0) for now.
        // NOTE: This will be removed at a later time when the architecture can
        //       handle this situation.,,
        var latlng = new google.maps.LatLng( 0.0, 0.0 );

        var marker = new google.maps.Marker({
            position: latlng,
            icon: new google.maps.MarkerImage( app_GetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
            map: map
        });

        google.maps.event.addListener( marker, 'click', function( event ) {
            viewMASAS_markerClicked( event, { marker: marker, identifier: entryModel.identifier } );
        });

        markers.push( { identifier: entryModel.identifier, viewObj: marker } );
    }
    else
    {
        if( geometry[0].type == "point" )
        {
            var point = geometry[0].data;
            var splitPoint = point.split( " " );
            var latlng = new google.maps.LatLng( splitPoint[0], splitPoint[1] );

            var marker = new google.maps.Marker({
                position: latlng,
                icon: new google.maps.MarkerImage( app_GetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
                map: map
            });

            google.maps.event.addListener( marker, 'click', function( event ) {
                viewMASAS_markerClicked( event, { marker: marker, identifier: entryModel.identifier } );
            });

            markers.push( { identifier: entryModel.identifier, viewObj: marker } );
        }
        else if( geometry[0].type == "polygon" )
        {
            var points = geometry[0].data;
            var splitPoints = points.split( " " );

            var pointArray = new google.maps.MVCArray();

            for( var i = 0; i < splitPoints.length; i += 2 )
            {
                var latlng = new google.maps.LatLng( splitPoints[i], splitPoints[i+1] );
                pointArray.push( latlng );
            }

            var polygon = new google.maps.Polygon({
                paths: pointArray,
                clickable: true,
                map: map,
                fillColor: "green",
                fillOpacity: 0.1,
                strokeColor: "green",
                strokeOpacity: 0.5,
                strokeWeight: 2,
                visible: false
            });

            google.maps.event.addListener( polygon, 'click', function( event ) {
                viewMASAS_polygonClicked( event, { polygon: polygon, identifier: entryModel.identifier } );
            });

            markers.push( { identifier: entryModel.identifier, viewObj: polygon } );
        }
        else if( geometry[0].type == "box" )
        {
            var points = geometry[0].data;
            var splitPoints = points.split( " " );

            // SW, NE..
            var llBounds;

            if( splitPoints[1] < splitPoints[3] )
            {
                llBounds = new google.maps.LatLngBounds( new google.maps.LatLng( splitPoints[0], splitPoints[3] ),
                    new google.maps.LatLng( splitPoints[2], splitPoints[1] ) );
            }
            else
            {
                llBounds = new google.maps.LatLngBounds( new google.maps.LatLng( splitPoints[0], splitPoints[1] ),
                    new google.maps.LatLng( splitPoints[2], splitPoints[3] ) );
            }

            var box = new google.maps.Rectangle({
                bounds: llBounds,
                clickable: true,
                map: map,
                fillColor: "green",
                fillOpacity: 0.1,
                strokeColor: "green",
                strokeOpacity: 0.5,
                strokeWeight: 2,
                visible: false
            });

            google.maps.event.addListener( box, 'click', function( event ) {
                viewMASAS_boxClicked( event, { box: box, identifier: entryModel.identifier } );
            });

            markers.push( { identifier: entryModel.identifier, viewObj: box } );
        }
    }
}

function viewMASAS_getViewObjFromIdentifier( identifier )
{
    var viewObj = undefined;
    for( var i = 0; i < markers.length; i++ )
    {
        if( markers[i].identifier == identifier ) {
            viewObj = markers[i].viewObj;
            break;
        }
    }

    return viewObj;
}

function viewMASAS_clearListOfEntriesFromMap()
{
    for( var i = 0; i < markers.length; i++ )
    {
        markers[i].viewObj.setMap( null );
        google.maps.event.clearInstanceListeners( markers[i].viewObj );
    }

    markers = [];
}

function viewMASAS_resizePage()
{
    var footer_height  = $.mobile.activePage.children('[data-role="footer"]').height();
    var entryTopNav_height  = $('#viewMASAS_entryTopNavBar').height();
    var entryBottomNav_height  = $('#viewMASAS_entryBottomNavBar').height();
    var window_height  = $(window).height();

    // iPad is reporting 1024 for both height and width so need to force the height
    // (20 is height of standard iOS information bar (signal, time, battery, etc.)
    if (iOS.device.iPad) {
      window_height = 768 - 20;
    }
                                    
    // Resize the Entry List
    var height = (window_height - footer_height - entryTopNav_height - entryBottomNav_height);
    $('#viewMASAS_lstEntries' ).height( height );
    $('#viewMASAS_lstEntries' ).css( "max-height", height );

    // Resize the Map Content
    height = (window_height - footer_height);
    $('#viewMASAS_mapContent' ).height( height );
    $('#viewMASAS_mapContent' ).css( "max-height", height );

    // Resize the Entry Content
    height = (window_height - footer_height);
    $('#viewMASAS_entryPanel' ).height( height );
    $('#viewMASAS_entryPanel' ).css( "max-height", height );
}

function viewMASAS_resetPagePadding()
{
    // "Fix" the padding on the page...
    var footer_height  = $.mobile.activePage.children('[data-role="footer"]').height();
    $("#viewMASAS" ).css( "padding-bottom", footer_height );
}

function viewMASAS_updateEntryPanel( entryIdentifier )
{
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( entryIdentifier );
    var masasEntry = entryModel.masasEntry;
    var entryXmlString = masasEntry.ToXML();

    if( !entryModel.IsReadOnly() )
    {
        $("#viewMASAS_grpEntryActions" ).show();

        if( entryModel.state == MASASMobile.EntryStateEnum.unpublished ) {
            $("#viewMASAS_btnCancelEntry" ).button( "disable" );
        }
        else {
            $("#viewMASAS_btnCancelEntry" ).button( "enable" );
        }
    }
    else
    {
        $("#viewMASAS_grpEntryActions" ).hide();
    }

    // Let's populate the <span> with data...
    $("#viewMASAS_entryId").text( masasEntry.identifier );

    $("#viewMASAS_entryAuthorName").text( masasEntry.author.name );
    $("#viewMASAS_entryAuthorURI").text( masasEntry.author.uri );

    // NOTE: these can be multilingual, for now lang='en' will be taken.
    $("#viewMASAS_entryTitle" ).text( masasEntry.GetTitle() );
    $("#viewMASAS_entryContent").text( masasEntry.GetContent() );

    // Single Categories...
    $("#viewMASAS_entryStatus").text( masasEntry.status );
    $("#viewMASAS_entryIcon").text( masasEntry.icon );
    $("#viewMASAS_entryCertainty").text( masasEntry.certainty );
    $("#viewMASAS_entrySeverity").text( masasEntry.severity );

    // Multiple Categories...
    var categories = "";
    for( var i = 0; i < masasEntry.categories.length ;i++ ) {
        categories += masasEntry.categories[i] + " ";
    }
    $("#viewMASAS_entryCategory").text( categories );

    if( masasEntry.published != undefined ) {
        $("#viewMASAS_entryPublished").text( masasEntry.published.toDateString() + ' ' + masasEntry.published.toLocaleTimeString() );
    }
    else {
        $("#viewMASAS_entryPublished").text( "N/A" );
    }

    if( masasEntry.updated != undefined ) {
        $("#viewMASAS_entryUpdated").text(  masasEntry.updated.toDateString() + ' ' + masasEntry.updated.toLocaleTimeString() );
    }
    else {
        $("#viewMASAS_entryUpdated").text(  "N/A" );
    }

    $("#viewMASAS_entryExpires").text( masasEntry.expires.toDateString() + ' ' + masasEntry.expires.toLocaleTimeString() );

    $("#viewMASAS_entryGeometry").text( masasEntry.geometry[0].type + ": " + masasEntry.geometry[0].data );

    // Populate the entry XML panel...
    $("#viewMASAS_entryXML" ).text( entryXmlString );

    // Populate the attachment panel...
    viewMASAS_resetAttachmentList();

    for( var i = 0; i < masasEntry.attachments.length; i++ ) {
        viewMASAS_addEntryAttachment( masasEntry.attachments[i] );
    }
    $('#viewMASAS_entryAttachmentsCount').text( masasEntry.attachments.length );
    $('#viewMASAS_entryAttachments').listview('refresh');
}

function viewMASAS_resetAttachmentList()
{
    // Remove all the <li> with containing the 'data-masas-report-attachment' attribute from the list.
    $('#viewMASAS_entryAttachments').children().remove( 'li[data-masas-entry-attachment]' );
    $('#viewMASAS_entryAttachmentsCount').text( 0 );
}

function viewMASAS_addEntryAttachment( attachment )
{
    var listItem, dataList = document.getElementById( 'viewMASAS_entryAttachments' );

    // Create our list item
    listItem = document.createElement('li');
    listItem.setAttribute( 'data-masas-entry-attachment', attachment.uri );
    listItem.setAttribute( 'data-masas-entry-attachment-type', attachment.contentType );

    var itemHTML  = '<a>';
    itemHTML += '<h3>' + attachment.title + '</h3>';
    itemHTML += '<p>' + attachment.contentType + '</p>'
    itemHTML += '</a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}

$( document ).delegate( "#viewMASAS_entryAttachments li[data-masas-entry-attachment]", "vclick", function( event )
{

    var attachmentUrl = $(this).attr( 'data-masas-entry-attachment' );
    var attachmentType = $(this).attr( 'data-masas-entry-attachment-type' );

    if( attachmentType.indexOf( 'image' ) >= 0 )
    {
        // Handle Images...
        $.mobile.loading( "show", { text: "Retrieving attachment.  Please Wait..."} );

        $( "#viewMASAS_previewImage" ).load( function() {
            $.mobile.loading( "hide" );
            $( "#viewMASAS_popupPhoto" ).popup( "open" );
        });

        $( "#viewMASAS_previewImage" ).error( function() {
            $.mobile.loading( "hide" );
            viewMASAS_getAttachmentFailed();
        });

        $( "#viewMASAS_previewImage" ).attr( "src", attachmentUrl + "?secret=" + app_Settings.token );

    }
    else if( attachmentType.indexOf( "xml" ) >= 0 || attachmentType.indexOf( "text") >= 0 )
    {
        // Handle Text and XML files
        $.mobile.loading( "show", { text: "Retrieving attachment.  Please Wait..."} );
        mmApp.masasHub.GetAttachment( attachmentUrl, viewMASAS_getAttachmentSuccess, viewMASAS_getAttachmentFailed );
    }
});

function viewMASAS_getAttachmentSuccess( response )
{
    var oSerializer = new XMLSerializer();
    var xmlString = oSerializer.serializeToString(response);

    $( "#viewMASAS_previewText" ).text( xmlString );
    $.mobile.loading( "hide" );
    $( "#viewMASAS_popupText" ).popup( "open" );
}

function viewMASAS_getAttachmentFailed()
{
    $.mobile.loading( "hide" );
    alert( 'Failed to retrieve attachment!');
}

function viewMASAS_hideEntryPanel()
{
    $("#viewMASAS_entryPanel").hide();
    $("#viewMASAS_mapContent").fadeIn( "slow" );
    $("#viewMASAS_btnToggleMap").find( '.ui-btn-text' ).text( "Details" );
}

function viewMASAS_showEntryPanel()
{
    $("#viewMASAS_entryPanel").show();
    $("#viewMASAS_mapContent").fadeOut( "slow" );
    $("#viewMASAS_btnToggleMap" ).find( '.ui-btn-text' ).text( "Map" );
}

function viewMASAS_enableControls( enable )
{
    if( enable )
    {
        $('#viewMASAS').removeClass('ui-disabled');
    }
    else
    {
        $('#viewMASAS').addClass('ui-disabled');
    }
}
