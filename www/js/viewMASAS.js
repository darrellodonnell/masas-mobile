/**
 * MASAS Mobile - View MASAS
 * Updated: Nov 18, 2012
 * Independent Joint Copyright (c) 2011-2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var mapInitialized = false;
var map = null;
var markers = [];
var infoWindow;

var $masasEntries;

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
        $("#viewMASAS_entryPanel").show();
        $("#viewMASAS_mapContent").fadeOut( "slow" );

        $("#viewMASAS_btnToggleMap" ).find( '.ui-btn-text' ).text( "Map" );
        //$("#viewMASAS").trigger("create");
    }
    else
    {
        $("#viewMASAS_entryPanel").hide();
        $("#viewMASAS_mapContent").fadeIn( "slow" );
        $("#viewMASAS_btnToggleMap").find( '.ui-btn-text' ).text( "Details" );
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

$( document ).delegate( "li[data-masas-entry-index]", "vclick", function( event )
{
    // Select the item...
    var entryIndex = $(this).attr( "data-masas-entry-index" );

    if( entryIndex !== undefined )
    {
        var marker = markers[entryIndex];

        viewMASAS_selectListItem( entryIndex );

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
        viewMASAS_updateEntryPanel( entryIndex );
    }
});

$( document ).delegate( "#viewMASAS_btnDefaultView", "vclick", function( event )
{
    var mapCenter = map.getCenter();

    app_Settings.map.defaultZoom = map.getZoom();
    app_Settings.map.defaultCenter.lat = mapCenter.lat();
    app_Settings.map.defaultCenter.lon = mapCenter.lng();

    appSaveSettingsData();
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


function viewMASAS_showMenu()
{
    $( "#viewMASAS_popupPanel" ).popup( "open", { transition : 'slide'} );
}

function viewMASAS_addListItem( listId, index, title, description, symbol )
{
    var listItem;
    var dataList = document.getElementById( listId );

    // Create our list item
    listItem = document.createElement('li');
    listItem.setAttribute( 'data-masas-entry-index', index );

    var itemHTML  = '<a>';
    itemHTML += '<div class="report_icon_wrapper">';
    itemHTML += '<img src="' + appGetSymbolPath( symbol ) + '" style="max-width:48px;max-height:48px;" />';
    itemHTML += '</div>';
    itemHTML += '<h3>' + title + '</h3>' + '<p>' + description + '</p></a>';
    //itemHTML += '<a href="#" data-icon="grid" data-theme="c"></a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}

function viewMASAS_refreshList()
{
    $("#viewMASAS_lstEntries").listview("refresh");
}

function viewMASAS_selectListItem( selectionId )
{
    var liCurSelect = $( "li[class*='ui-masas-list-item-selected']" );
    var curSelectIndex = -1;

    // De-select the previous item...
    if( liCurSelect.length > 0 )
    {
        curSelectIndex = $(liCurSelect).attr( "data-masas-entry-index" );
        liCurSelect.removeClass( "ui-masas-list-item-selected" );

        if( markers[curSelectIndex] instanceof google.maps.Polygon || markers[curSelectIndex] instanceof google.maps.Rectangle )
        {
            markers[curSelectIndex].setVisible( false );
        }

        // Close the InfoWindow
        infoWindow.close();
    }

    var liToSelect = $("li[data-masas-entry-index='" + selectionId + "']");
    liToSelect.addClass( "ui-masas-list-item-selected" );

    if( markers[selectionId] instanceof google.maps.Polygon || markers[selectionId] instanceof google.maps.Rectangle )
    {
        markers[selectionId].setVisible( true );
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

    MASAS_getEntries( options, viewMASAS_getEntriesSuccess, viewMASAS_getEntriesFailure );
}

function viewMASAS_getEntriesSuccess( xmlFeed )
{
    // Clear the existing list...
    viewMASAS_clearListOfEntries();

    if( app_IsMapSupported ) {
        viewMASAS_clearListOfEntriesFromMap();
    }

    $masasEntries = $(xmlFeed).find( "entry" );

    if( $masasEntries.length > 0 )
    {
        for( var i = 0; i<$masasEntries.length; i++)
        {
            var entry = $masasEntries[i];

            // NOTE: these can be multilingual, for now lang='en' will be taken.
            var title = $(entry).find( "title div[xml\\:lang='en']" );
            var description = $(entry).find( "content div[xml\\:lang='en']" );

            var $catIcon = $(entry).find( "category[scheme='masas:category:icon']" );
            var symbol = $catIcon.attr( "term" );

            if( symbol == undefined || symbol == "other" )
            {
                symbol = "ems.other.other";
            }

            symbol = symbol.replace(/\//g, "." );

            var $geometry;
            $geometry = $(entry).find( "point" );
            if( $geometry.length == 0 )
            {
                $geometry = $(entry).find( "polygon" );
                if( $geometry.length == 0 )
                {
                    $geometry = $(entry).find( "box" );
                }
            }

            // At the entry to the list...
            viewMASAS_addListItem( "viewMASAS_lstEntries", i, $(title[0]).text(), $(description[0]).text(), symbol );

            if( app_IsMapSupported ) {
                viewMASAS_addMapItem( i, symbol, $geometry );
            }
        }
    }

    viewMASAS_refreshList();
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
    var entry = $masasEntries[data.index];
    // NOTE: these can be multilingual, for now lang='en' will be taken.
    var title = $(entry).find( "title div[xml\\:lang='en']" );
    var description = $(entry).find( "content div[xml\\:lang='en']" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $(title[0]).text() + " " + $(description[0]).text() );
    infoWindow.open( map, data.marker );
}

function viewMASAS_polygonClicked( event, data )
{
    var entry = $masasEntries[data.index];
    var title = $(entry).find( "title div[xml\\:lang='en']" );
    var description = $(entry).find( "content div[xml\\:lang='en']" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $(title[0]).text() + " " + $(description[0]).text() );
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_boxClicked( event, data )
{
    var entry = $masasEntries[data.index];
    var title = $(entry).find( "title div[xml\\:lang='en']" );
    var description = $(entry).find( "content div[xml\\:lang='en']" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $(title[0]).text() + " " + $(description[0]).text() );
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_addMapItem( index, symbol, $geometry )
{
    if( $geometry.length == 0 )
    {
        // No geometry is available... show a marker at (0,0) for now.
        // NOTE: This will be removed at a later time when the architecture can
        //       handle this situation.,,
        var latlng = new google.maps.LatLng( 0.0, 0.0 );

        var marker = new google.maps.Marker({
            position: latlng,
            icon: new google.maps.MarkerImage( appGetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
            map: map
        });

        google.maps.event.addListener( marker, 'click', function( event ) {
            viewMASAS_markerClicked( event, { marker: marker, index: index } );
        });

        markers.push( marker );
    }
    else
    {
        if( $geometry[0].nodeName == "georss:point" )
        {
            var point = $geometry.text();
            var splitPoint = point.split( " " );
            var latlng = new google.maps.LatLng( splitPoint[0], splitPoint[1] );

            var marker = new google.maps.Marker({
                position: latlng,
                icon: new google.maps.MarkerImage( appGetSymbolPath( symbol ), null, null, null, new google.maps.Size( 32, 32 ) ),
                map: map
            });

            google.maps.event.addListener( marker, 'click', function( event ) {
                viewMASAS_markerClicked( event, { marker: marker, index: index } );
            });

            markers.push( marker );
        }
        else if( $geometry[0].nodeName == "georss:polygon" )
        {
            var points = $geometry.text();
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
                viewMASAS_polygonClicked( event, { polygon: polygon, index: index } );
            });

            markers.push( polygon );
        }
        else if( $geometry[0].nodeName == "georss:box" )
        {
            var points = $geometry.text();
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
                viewMASAS_boxClicked( event, { box: box, index: index } );
            });

            markers.push( box );
        }
    }
}

function viewMASAS_clearListOfEntriesFromMap()
{
    for( var i = 0; i < markers.length; i++ )
    {
        markers[i].setMap( null );
        google.maps.event.clearInstanceListeners( markers[i] );
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

function viewMASAS_updateEntryPanel( entryIndex )
{
    var entry = $masasEntries[entryIndex];
    var oSerializer = new XMLSerializer();
    var entryXmlString = oSerializer.serializeToString(entry);

    // Let's populate the <span> with data...
    $("#viewMASAS_entryId").text( $(entry).find( "id" ).text() );

    $("#viewMASAS_entryAuthorName").text( $(entry).find( "author > name" ).text() );
    $("#viewMASAS_entryAuthorURI").text( $(entry).find( "author > uri" ).text() );

    // NOTE: these can be multilingual, for now lang='en' will be taken.
    var titleTxt = $(entry).find( "title div[xml\\:lang='en']" );
    $("#viewMASAS_entryTitle" ).text( $(titleTxt[0]).text() );

    var contentTxt = $(entry).find( "content div[xml\\:lang='en']" );
    $("#viewMASAS_entryContent").text( $(contentTxt[0]).text() );

    // Single Categories...
    $("#viewMASAS_entryStatus").text( $(entry).find( "category[scheme='masas:category:status']" ).attr( "term" ) );
    $("#viewMASAS_entryIcon").text( $(entry).find( "category[scheme='masas:category:icon']" ).attr( "term" ) );

    // Multiple Categories...
    $("#viewMASAS_entryCertainty").text( $(entry).find( "category[scheme='masas:category:certainty']" ).attr( "term" ) );
    $("#viewMASAS_entryCategory").text( $(entry).find( "category[scheme='masas:category:category']" ).attr( "term" ) );
    $("#viewMASAS_entrySeverity").text( $(entry).find( "category[scheme='masas:category:severity']" ).attr( "term" ) );

    $("#viewMASAS_entryPublished").text( $(entry).find( "published" ).text() );
    $("#viewMASAS_entryUpdated").text( $(entry).find( "updated" ).text() );
    $("#viewMASAS_entryExpires").text( $(entry).find( "expires" ).text() );
    $("#viewMASAS_entryGeometry").text( $(entry).find( "point, polygon, box" ).text() );

    // Populate the entry XML panel...
    $("#viewMASAS_entryXML" ).text( entryXmlString );

    // Populate the attachment panel...
    viewMASAS_resetAttachmentList();
    var attachments = $(entry).find( "link[rel='enclosure']" );

    for( var i=0; i<attachments.length; i++ )
    {
        viewMASAS_addEntryAttachment( attachments[i] );
    }
    $('#viewMASAS_entryAttachmentsCount').text( attachments.length );
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
    listItem.setAttribute( 'data-masas-entry-attachment', $( attachment ).attr( "href" ) );
    listItem.setAttribute( 'data-masas-entry-attachment-type', $( attachment ).attr( "type" ) );

    var itemHTML  = '<a>';
    itemHTML += '<h3>' + $( attachment ).attr( "title" ) + '</h3>';
    itemHTML += '<p>' + $( attachment ).attr( "type" ) + '</p>'
    itemHTML += '</a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}

$( document ).delegate( "li[data-masas-entry-attachment]", "vclick", function( event )
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
        MASAS_getAttachment( attachmentUrl, viewMASAS_getAttachmentSuccess, viewMASAS_getAttachmentFailed );
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