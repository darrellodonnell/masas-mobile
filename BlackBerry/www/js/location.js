var location_latitude = undefined;
var location_longitude = undefined;
var location_selectedlookup = "";
var location_results = null;

$( document ).delegate("#location", "pagebeforecreate", function()
{
    location_resetList();
});

$( document ).delegate( "#location_txtSearchQuery", "keypress", function( event )
{
    if ( event.which == 13 )
    {
        event.preventDefault();
        location_search( $('#location_txtSearchQuery').val() );
    }
});

$( document ).delegate( ".ui-input-search", "vclick", function( event )
{
    var $target = $(event.target);

    if( $target.find( '#location_txtSearchQuery' ) && event.target.className.indexOf( 'ui-input-search' ) != -1 )
    {
        var searchQuery = $('#location_txtSearchQuery').val();
        if( searchQuery.length > 0 )
        {
            location_search( searchQuery );
        }
    }
});

$( document ).delegate( "li[data-masas-location-result-id]", "vclick", function( event )
{
    if( $.mobile.activePage.attr('id') == 'location' && event.currentTarget.parentNode.id == "location_lstResults" )
    {
        var resultId = $(this).attr( 'data-masas-location-result-id' );
        if( location_results != null && resultId < location_results.length )
        {
            location_latitude = location_results[resultId].lat;
            location_longitude = location_results[resultId].lon;
            location_selectedlookup = location_results[resultId].display_name;

            // Go back to the previous page...
            history.back();
            return false;
        }
        else {
            alert( "The selected item no longer exists! Please try the search again.")
        }
    }

});

$( document).delegate( "#location_osmCopyrightLink", "vclick", function()
{
    var args = new blackberry.invoke.BrowserArguments('http://www.openstreetmap.org/copyright');
    blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER, args);
});

$( document ).delegate( "#location_btnBack", "vclick", function()
{
    // Go back to the previous page...
    history.back();
    return false;
});

function location_search( searchQuery )
{
    location_resetList();
    $('#location_lstResults').listview('refresh');
    $('#location_resultStatus').text( 'Searching...' );

    console.log( 'Searching...' );

    var params = '';
    params += '?q=';
    if( searchQuery != null && searchQuery.length > 0 )
    {
        params += searchQuery.replace( / /g, '+' );
    }

    params += '&format=json';
    params += '&addressdetails=1';
    params += '&limit=3';

    // Get the email address for the query...
    // NOTE: This is required by Nominatim as per their usage policy:
    //       http://wiki.openstreetmap.org/wiki/Nominatim_usage_policy
    if( blackberry && blackberry.app && blackberry.app.authorEmail )
    {
        params += '&email=' + blackberry.app.authorEmail;
    }

    console.log( params );

    var request = $.ajax({
        type: 'GET',
        url: 'http://nominatim.openstreetmap.org/search' + params,
        timeout: 60000
    });

    request.done( function( msg ) {
        console.log( msg );
        location_results = msg;
        location_loadResults( location_results );
    });

    request.fail( function(jqXHR, textStatus) {
        var failureMsg = 'Location retrieval failed! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
        console.log( failureMsg );
        alert( failureMsg );

    });
}

function location_loadResults( results )
{
    location_resetList();

    if( results.length <= 0 )
    {
        $('#location_resultStatus').text( 'No results found.' );
    }
    else
    {
        $('#location_resultStatus').text( '' );
        for( var i=0;i<results.length;i++)
        {
            location_addListItem( results[i], i );
        }

        $('#location_lstResults').listview('refresh');
    }
}

function location_resetList()
{
    // Remove all the <li> with containing the 'data-masas-report-attachment' attribute from the list.
    $('#location_lstResults').children().remove( 'li' );
}

function location_addListItem( addressData, identifier )
{
    var listItem, dataList = document.getElementById( 'location_lstResults' );

    // Create our list item
    listItem = document.createElement('li');
    listItem.setAttribute( 'data-masas-location-result-id', identifier );

    var itemHTML  = '<a>';

    itemHTML += '<h3>' + addressData.display_name + '</h3>';
    itemHTML += '<p>Lat: ' + addressData.lat + ', Longitude: ' + addressData.lon + '</p>'
    itemHTML += '</a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.appendChild( listItem );
}