/**
 * MASAS Mobile - View MASAS
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var viewMASAS_mapInitialized = false;
var viewMASAS_map = null;
var viewMASAS_markers = [];
var viewMASAS_infoWindow;
var viewMASAS_tempMapBound = undefined;
var viewMASAS_entryToCancel = null;

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

    // Disable the "Details" button
    $('#viewMASAS_btnToggleMap').addClass('ui-disabled');
});

$( document ).delegate( "#viewMASAS", "pagehide", function( event, ui )
{
    viewMASAS_map = null;
    viewMASAS_mapInitialized = false;
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

    $( "#viewMASAS_popupText #viewMASAS_previewText" ).css( "max-height", maxHeight );
    $( "#viewMASAS_popupText #viewMASAS_previewText" ).css( "max-width", maxWidth );
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
            viewMASAS_map.panTo( marker.getPosition() );
        }
        else if( marker instanceof google.maps.Polygon )
        {
            var bounds = new google.maps.LatLngBounds();
            var path = marker.getPath();

            for( var i=0; i<path.length; i++ )
            {
                bounds.extend( path.getAt( i ) );
            }

            viewMASAS_map.fitBounds( bounds );
        }
        else if( marker instanceof google.maps.Rectangle )
        {
            viewMASAS_map.fitBounds( marker.getBounds() );
        }

        viewMASAS_updateEntryPanelById( entryId );
    }
});

$( document ).delegate( "#viewMASAS_btnDefaultView", "vclick", function( event )
{
    var mapCenter = viewMASAS_map.getCenter();

    app_Settings.map.defaultZoom = viewMASAS_map.getZoom();
    app_Settings.map.defaultCenter.lat = mapCenter.lat();
    app_Settings.map.defaultCenter.lon = mapCenter.lng();

    appSaveSettingsData();
    viewMASAS_hideMenu();
});

$( document ).delegate( "#viewMASAS_btnAddFilter", "vclick", function( event )
{
    var mapBounds = viewMASAS_map.getBounds();
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

    viewMASAS_cancelEntry( selectedEntry );
});

$( document ).delegate( "#viewMasas_popupBtnCancelEntry", "vclick", function( event )
{
    // Close the popup...
    $("#viewMASAS_popupCancelEntry").popup( "close" );

    // Open the entryPage if a proper entry is selected...
    if( viewMASAS_entryToCancel != undefined && !viewMASAS_entryToCancel.IsReadOnly() )
    {
        viewMASAS_enableControls( false );
        $.mobile.showPageLoadingMsg( "a", "Cancelling MASAS Entry..." );
        mmApp.masasPublisher.CancelEntry( viewMASAS_entryToCancel, viewMASAS_cancelEntrySuccess, viewMASAS_cancelEntryFailed );
    }

    viewMASAS_entryToCancel = null;
});

function viewMASAS_cancelEntry( entryModel )
{
    viewMASAS_entryToCancel = entryModel;
    $("#viewMASAS_popupCancelEntry").popup( "open" );
}

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
    var curSelectId = -1;
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
        viewMASAS_infoWindow.close();
    }

    var liToSelect = $("li[data-masas-entry-identifier='" + selectionId + "']");
    liToSelect.addClass( "ui-masas-list-item-selected" );

    if( markerToSelect instanceof google.maps.Polygon || markerToSelect instanceof google.maps.Rectangle )
    {
        markerToSelect.setVisible( true );
    }

    viewMASAS_refreshList();

    // Enable the "Details" button
    $('#viewMASAS_btnToggleMap').removeClass('ui-disabled');
}

function viewMASAS_initializeMap()
{
    if (!viewMASAS_mapInitialized)
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

        viewMASAS_map = new google.maps.Map( document.getElementById( "viewMASAS_mapCanvas" ), myOptions );

        google.maps.event.addListener( viewMASAS_map, 'bounds_changed', viewMASAS_onMapBoundsChanged );

        var $infoWindowContent = $("#viewMASAS_mapPopup");
        viewMASAS_infoWindow = new google.maps.InfoWindow( {maxWidth: 350} );
        viewMASAS_infoWindow.setContent($infoWindowContent[0]);

        viewMASAS_mapInitialized = true;
    }
    else {
        google.maps.event.trigger( viewMASAS_map, 'resize' );
    }
}

function viewMASAS_onMapBoundsChanged()
{
    console.log( "Event: viewMASAS_onMapBoundsChanged" );

    var viewBounds = viewMASAS_map.getBounds();

    // Let's re-evaluate all the polygon markers...
    for( var iMarker = 0; iMarker < viewMASAS_markers.length; iMarker++ )
    {

        var curMarker = viewMASAS_markers[iMarker];

        if( curMarker.viewObj instanceof google.maps.Polygon )
        {
            var gMarker = curMarker.marker;
            var gPolygon = curMarker.viewObj;

            var bounds = new google.maps.LatLngBounds();
            var path = gPolygon.getPath();

            for( var iPath = 0; iPath < path.length; iPath++ ) {
                bounds.extend( path.getAt( iPath ) );
            }

            viewMASAS_applyMarkerPosition( gMarker, viewBounds, bounds );
        }
        else if( curMarker instanceof google.maps.Rectangle )
        {
            var gMarker = curMarker.marker;
            var gRectangle = curMarker.viewObj;

            var bounds = gRectangle.getBounds();

            viewMASAS_applyMarkerPosition( gMarker, viewBounds, bounds );
        }

    }

}

function viewMASAS_applyMarkerPosition( marker, viewBounds, polygonBounds )
{
    if( polygonBounds.intersects( viewBounds ) )
    {
        // Polygon bounds intersects the view...
        // Is the bounds completely in the view?
        if( polygonBounds.contains( viewBounds.getSouthWest() ) && polygonBounds.contains( viewBounds.getNorthEast() ) )
        {
            // The view is inside the polygon...
            marker.setPosition( viewBounds.getCenter() );
        }
        else {
            // The polygon overlaps the view...
            marker.setPosition( polygonBounds.getCenter() );
        }
    }
    else
    {
        // Polygon bounds is outside the view...
        marker.setPosition( polygonBounds.getCenter() );
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

    // Remove the active state on viewMASAS_btnRefreshList
    $(".ui-btn-active").removeClass('ui-btn-active');
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
    // Remove the active state on viewMASAS_btnRefreshList
    $(".ui-btn-active").removeClass('ui-btn-active');
}

function viewMASAS_clearListOfEntries()
{
    // Remove all the <li> from the list.
    $('#viewMASAS_lstEntries').children().remove( 'li' );
}

function viewMASAS_setInfoContent( entryModel )
{
    var node = ( $("#viewMASAS_mapPopup").clone() );
    var cancelBtn = $(node).find( "#viewMASAS_btnMapCancelEntry");

    $(node).show();
    $(node).find( "#viewMASAS_mapPopupTitle" ).text( entryModel.masasEntry.GetTitle() );
    $(node).find( "#viewMASAS_mapPopupContent" ).text( entryModel.masasEntry.GetContent() );

    if( !entryModel.IsReadOnly() )
    {
        $(cancelBtn).bind( "click", function( event, ui )
        {
            // Cancel the Entry...
            viewMASAS_cancelEntry( entryModel );
            viewMASAS_infoWindow.close();
        });
    }
    else {
        $(cancelBtn).closest('.ui-btn').hide();
    }

    $(node).find( "#viewMASAS_btnMapViewEntry").bind( "click", function( event, ui )
    {
        // Display the Entry details...
        viewMASAS_updateEntryPanel( entryModel );
        viewMASAS_showEntryPanel();
        viewMASAS_infoWindow.close();
    });

    viewMASAS_infoWindow.setContent( node[0] );
}

function viewMASAS_markerClicked( event, data )
{
    // Get the entry model...
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // Select the entry in the list...
    viewMASAS_selectListItem( data.identifier );

    // Set the Info Window's content...
    viewMASAS_setInfoContent( entryModel );

    // Show the Info Window...
    viewMASAS_infoWindow.open( viewMASAS_map, data.marker );
}

function viewMASAS_polygonClicked( event, data )
{
    // Get the entry model...
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // Select the entry in the list...
    viewMASAS_selectListItem( data.identifier );

    // Set the Info Window's content...
    viewMASAS_setInfoContent( entryModel );

    // Show the Info Window...
    viewMASAS_infoWindow.setPosition( event.latLng );
    viewMASAS_infoWindow.open( viewMASAS_map );
}

function viewMASAS_boxClicked( event, data )
{
    // Get the entry model...
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( data.identifier );

    // Select the entry in the list...
    viewMASAS_selectListItem( data.identifier );

    // Set the Info Window's content...
    viewMASAS_setInfoContent( entryModel );

    // Show the Info Window...
    viewMASAS_infoWindow.setPosition( event.latLng );
    viewMASAS_infoWindow.open( viewMASAS_map );
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
            map: viewMASAS_map
        });

        google.maps.event.addListener( marker, 'click', function( event ) {
            viewMASAS_markerClicked( event, { marker: marker, identifier: entryModel.identifier } );
        });

        viewMASAS_markers.push( { identifier: entryModel.identifier, viewObj: marker } );
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
                map: viewMASAS_map
            });

            google.maps.event.addListener( marker, 'click', function( event ) {
                viewMASAS_markerClicked( event, { marker: marker, identifier: entryModel.identifier } );
            });

            viewMASAS_markers.push( { identifier: entryModel.identifier, viewObj: marker } );
        }
        else if( geometry[0].type == "polygon" )
        {
            var llBounds = new google.maps.LatLngBounds();
            var points = geometry[0].data;
            var splitPoints = points.split( " " );

            var pointArray = new google.maps.MVCArray();

            for( var i = 0; i < splitPoints.length; i += 2 )
            {
                var latlng = new google.maps.LatLng( splitPoints[i], splitPoints[i+1] );
                pointArray.push( latlng );
                llBounds.extend( latlng );
            }

            // Polygon...
            var polygon = new google.maps.Polygon({
                paths: pointArray,
                clickable: true,
                map: viewMASAS_map,
                fillColor: "green",
                fillOpacity: 0.1,
                strokeColor: "green",
                strokeOpacity: 0.5,
                strokeWeight: 2,
                visible: false
            });

            // Centroid marker...
            var marker = new google.maps.Marker({
                position: llBounds.getCenter(),
                icon: new google.maps.MarkerImage( app_GetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
                map: viewMASAS_map
            });

            google.maps.event.addListener( polygon, 'click', function( event ) {
                viewMASAS_polygonClicked( event, { polygon: polygon, identifier: entryModel.identifier } );
            });

            google.maps.event.addListener( marker, 'click', function( event ) {
                viewMASAS_polygonClicked( event, { polygon: polygon, identifier: entryModel.identifier } );
            });

            viewMASAS_markers.push( { identifier: entryModel.identifier, viewObj: polygon, marker: marker } );
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

            // Box...
            var box = new google.maps.Rectangle({
                bounds: llBounds,
                clickable: true,
                map: viewMASAS_map,
                fillColor: "green",
                fillOpacity: 0.1,
                strokeColor: "green",
                strokeOpacity: 0.5,
                strokeWeight: 2,
                visible: false
            });

            // Centroid marker...
            var marker = new google.maps.Marker({
                position: llBounds.getCenter(),
                icon: new google.maps.MarkerImage( app_GetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
                map: viewMASAS_map
            });

            google.maps.event.addListener( box, 'click', function( event ) {
                viewMASAS_boxClicked( event, { box: box, identifier: entryModel.identifier } );
            });

            google.maps.event.addListener( marker, 'click', function( event ) {
                viewMASAS_boxClicked( event, { box: box, identifier: entryModel.identifier } );
            });

            viewMASAS_markers.push( { identifier: entryModel.identifier, viewObj: box, marker: marker } );
        }
    }
}

function viewMASAS_getViewObjFromIdentifier( identifier )
{
    var viewObj = undefined;
    for( var i = 0; i < viewMASAS_markers.length; i++ )
    {
        if( viewMASAS_markers[i].identifier == identifier ) {
            viewObj = viewMASAS_markers[i].viewObj;
            break;
        }
    }

    return viewObj;
}

function viewMASAS_clearListOfEntriesFromMap()
{
    for( var i = 0; i < viewMASAS_markers.length; i++ )
    {
        viewMASAS_markers[i].viewObj.setMap( null );
        google.maps.event.clearInstanceListeners( viewMASAS_markers[i].viewObj );
    }

    viewMASAS_markers = [];
}

function viewMASAS_resizePage()
{
    var footer_height  = $.mobile.activePage.children('[data-role="footer"]').height();
    var entryTopNav_height  = $('#viewMASAS_entryTopNavBar').height();
    var entryBottomNav_height  = $('#viewMASAS_entryBottomNavBar').height();
    var window_height  = $(window).height();

    // If the top nav bar is hidden...
    if( $("#viewMASAS_entryTopNavBar").is( ":hidden" ) ) {
        entryTopNav_height = 0;
    }

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

function viewMASAS_updateEntryPanelById( entryIdentifier )
{
    var entryModel = mmApp.entryManager.GetEntryByIdentifier( entryIdentifier );
    viewMASAS_updateEntryPanel( entryModel );
}

function viewMASAS_updateEntryPanel( entryModel )
{
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

    // Releated link...
    var relatedLink = masasEntry.GetLink( "related" );
    if( relatedLink != undefined ) {
        $("#viewMASAS_relatedLink").prop( "href", relatedLink );
        $("#viewMASAS_relatedText").text( relatedLink );
    }
    else {
        $("#viewMASAS_relatedLink").prop( "href", "" );
        $("#viewMASAS_relatedText").text( "" );
    }


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

$( document ).delegate( "#viewMASAS_relatedLink", "vclick", function( event )
{
    event.preventDefault();
    window.open($(this).attr("href"),"_system");
    return false;
});

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
        if( attachmentUrl.indexOf( 'file:///' ) == 0 )
        {
            $("#viewMASAS_previewImage").attr( "src", attachmentUrl );
            $("#viewMASAS_popupPhoto").popup( "open" );
        }
        else
        {
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

    }
    else if( attachmentType.indexOf( 'audio' ) >= 0 )
    {
        // Handle Images...
        if( attachmentUrl.indexOf( 'http' ) == 0 )
        {
            attachmentUrl += "?secret=" + app_Settings.token
        }

        $("#viewMASAS_previewAudio").attr( "src", attachmentUrl );
        $("#viewMASAS_popupAudio").popup( "open" );
    }
    else if( attachmentType.indexOf( "application/common-alerting-protocol+xml" ) == 0 )
    {
        if( attachmentUrl.indexOf( 'file:///' ) == 0 )
        {
            // TODO: Load from local storage!
            alert( "Loading a local CAP file is currently not supported!" );
        }
        else
        {
            $.mobile.loading( "show", { text: "Retrieving attachment.  Please Wait..."} );
            mmApp.masasHub.GetAttachment( attachmentUrl, viewMASAS_getCAPAttachmentSuccess, viewMASAS_getAttachmentFailed );
        }
    }
    else if( attachmentType.indexOf( "xml" ) >= 0 || attachmentType.indexOf( "text") >= 0 )
    {
        // Handle Text and XML files
        if( attachmentUrl.indexOf( 'file:///' ) == 0 )
        {
            // TODO: Load from local storage!
            alert( "Loading a local xml or text file is currently not supported!" );
        }
        else
        {
            $.mobile.loading( "show", { text: "Retrieving attachment.  Please Wait..."} );
            mmApp.masasHub.GetAttachment( attachmentUrl, viewMASAS_getTextAttachmentSuccess, viewMASAS_getAttachmentFailed );
        }
    }
});

function viewMASAS_getCAPAttachmentSuccess( msg )
{
    var xsl = undefined;
    var xml = msg;

    // Figure out what CAP version we are dealing with...
    var alertElement = xml.getElementsByTagName( "alert" );
    if( alertElement.length > 0 && alertElement[0].namespaceURI.indexOf( "urn:oasis:names:tc:emergency:cap:1.2" ) >= 0 ) {
        xsl = viewMASAS_loadXMLDoc( "./xsl/CAP_v1.2.xslt" );
    }
    else {
        xsl = viewMASAS_loadXMLDoc( "./xsl/CAP_v1.1.xslt" );
    }

    if( xsl )
    {
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet( xsl );
        resultDocument = xsltProcessor.transformToFragment( xml, document );

        $( "#viewMASAS_previewText" ).empty();
        $( "#viewMASAS_previewText").append( resultDocument );
    }
    else
    {
        var oSerializer = new XMLSerializer();
        var xmlString = oSerializer.serializeToString( msg );
        $( "#viewMASAS_previewText" ).text( xmlString );
    }
    $.mobile.loading( "hide" );

    $( "#viewMASAS_popupText" ).popup( "open" );
}

function viewMASAS_loadXMLDoc(dname)
{
    var response = undefined;

    var request = $.ajax({
        type: 'GET',
        async: false,
        url: dname,
        timeout: 120000
    });

    request.done( function( msg ) {
        response = msg;
    });

    return response;
}

function viewMASAS_getTextAttachmentSuccess( msg )
{
    var oSerializer = new XMLSerializer();
    var xmlString = oSerializer.serializeToString( msg );

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

    viewMASAS_map.setCenter( viewMASAS_tempMapBound.center );
    viewMASAS_map.setZoom( viewMASAS_tempMapBound.zoom );
}

function viewMASAS_showEntryPanel()
{
    viewMASAS_tempMapBound = { center: viewMASAS_map.getCenter(),
                               zoom: viewMASAS_map.getZoom() };

    // Get the select the item...
    viewMASAS_updateEntryPanelById( viewMASAS_getSelectListItemId() );

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
