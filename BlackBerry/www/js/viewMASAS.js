/**
 * MASAS Mobile - View MASAS
 * Updated: Oct 30, 2012
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

$( document ).delegate( "#viewMASAS_btnRefreshList", "click", function( event, ui )
{
    viewMASAS_refreshListOfEntries();
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
    }
});

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
    itemHTML += '<a href="#" data-icon="grid" data-theme="c"></a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
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

    $("#viewMASAS_lstEntries").listview("refresh");
}

function viewMASAS_initializeMap()
{
    if (!mapInitialized)
    {
        var latlng = new google.maps.LatLng( 45.3225, -75.6692 );

        var myOptions = {
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            },
            mapTypeControl: true,
            zoom: 10,
            center: latlng,
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
    MASAS_getEntries( viewMASAS_getEntriesSuccess, viewMASAS_getEntriesFailure );
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
            var $title = $(entry).find( "title" );
            var $description = $(entry).find( "content" );
            var $catIcon = $(entry).find( "category[scheme='masas:category:icon']" );
            var symbol = $catIcon.attr( "term" );

            console.log( 'Symbol from RSS: ' + symbol );

            if( symbol == undefined || symbol == "other" )
            {
                symbol = "ems.other.other";
            }

            symbol = symbol.replace(/\//g, "." );
            console.log( 'Converted Symbol: ' + symbol );

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
            viewMASAS_addListItem( "viewMASAS_lstEntries", i, $title.text(), $description.text(), symbol );

            if( app_IsMapSupported ) {
                viewMASAS_addMapItem( i, symbol, $geometry );
            }
        }
    }

    $("#viewMASAS_lstEntries").listview("refresh");
    $("#scrollPanel").iscrollview("resizeWrapper");

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
    var $title = $(entry).find( "title" );
    var $description = $(entry).find( "content" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $title.text() + " " + $description.text() );
    infoWindow.open( map, data.marker );
}

function viewMASAS_polygonClicked( event, data )
{
    var entry = $masasEntries[data.index];
    var $title = $(entry).find( "title" );
    var $description = $(entry).find( "content" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $title.text() + " " + $description.text() )
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_boxClicked( event, data )
{
    var entry = $masasEntries[data.index];
    var $title = $(entry).find( "title" );
    var $description = $(entry).find( "content" );

    viewMASAS_selectListItem( data.index );

    infoWindow.setContent( $title.text() + " " + $description.text() );
    infoWindow.setPosition( event.latLng );
    infoWindow.open( map );
}

function viewMASAS_addMapItem( index, symbol, $geometry )
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

function viewMASAS_clearListOfEntriesFromMap()
{
    for( var i = 0; i < markers.length; i++ )
    {
        markers[i].setMap( null );
        google.maps.event.clearInstanceListeners( markers[i] );
    }

    markers = [];
}
