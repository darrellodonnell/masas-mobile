/**
 * MASAS Mobile - MASAS helper functions
 * Updated: Nov 18, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var currentEntry = null;

var MASAS_callback_createNewEntry_success = null;
var MASAS_callback_createNewEntry_failure = null;

var MASAS_callback_getEntries_success = null;
var MASAS_callback_getEntries_failure = null;

var MASAS_callback_getAttachment_success = null;
var MASAS_callback_getAttachment_failure = null;

function MASAS_createNewEntry( entry, callback_success, callback_fail )
{
    MASAS_callback_createNewEntry_success = callback_success;
    MASAS_callback_createNewEntry_failure = callback_fail;

    currentEntry = entry;
    var postData = '';

    postData = '<?xml version="1.0" encoding="UTF-8"?>';
    postData += '<entry xmlns="http://www.w3.org/2005/Atom">';
    postData += '<category label="Status" scheme="masas:category:status" term="' + entry.status + '"/>';
    postData += '<category label="Icon" scheme="masas:category:icon" term="' + entry.icon + '"/>';
    postData += '<title type="xhtml">';
    postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
    postData += '<div xml:lang="en">' + entry.title + '</div>';
    postData += '</div>';
    postData += '</title>';
    postData += '<content type="xhtml">';
    postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
    postData += '<div xml:lang="en">' + entry.content + '</div>';
    postData += '</div>';
    postData += '</content>';

    if( "summary" in entry )
    {
        postData += '<summary type="xhtml">';
        postData += '<div xmlns="http://www.w3.org/1999/xhtml">';
        postData += '<div xml:lang="en">' + entry.summary + '</div>';
        postData += '</div>';
        postData += '</summary>';
    }

    postData += '<expires xmlns="http://purl.org/atompub/age/1.0">' + entry.expires.toISOString() + '</expires>';
    postData += '<point xmlns="http://www.georss.org/georss">' + entry.point.latitude + ' ' + entry.point.longitude + '</point>';
    postData += '</entry>';

    if( "attachments" in entry && entry.attachments.length > 0 )
    {
        MASAS_postNewEntryWithAttachments( postData, entry.attachments );
    }
    else
    {
        MASAS_postNewEntry( postData, 'application/atom+xml' );
    }
}

function MASAS_postNewEntry( entryData, contentType )
{
    console.log( 'MASAS_postNewEntry' );

    var request = $.ajax({
        type: 'POST',
        url: app_Settings.url + '/feed',
        headers: {'Content-Type': contentType,
                  'Authorization': 'MASAS-Secret ' + app_Settings.token },
        data: entryData,
        timeout: 120000
    });

    request.done( function(msg) {
            console.log(msg);
            console.log('Posted to MASAS Hub successfully!');
            alert('Posted to MASAS Hub successfully!');

            if( MASAS_callback_createNewEntry_success && typeof( MASAS_callback_createNewEntry_success ) === "function" )
            {
                MASAS_callback_createNewEntry_success();
            }
    });

    request.fail( function(jqXHR, textStatus) {
        console.log( jqXHR );
        console.log( 'Fail status: ' + textStatus );

        var failureMsg = 'Posting failed! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
        console.log( failureMsg );

        if( MASAS_callback_createNewEntry_failure && typeof( MASAS_callback_createNewEntry_failure ) === "function" )
        {
            MASAS_callback_createNewEntry_failure( failureMsg );
        }

    });
}

function MASAS_postNewEntryWithAttachments( entryData, attachments )
{
    var newData = '';
    newData  = '--0.a.unique.value.0\r\n';
    newData += 'Content-Disposition: attachment; name="entry"; filename="entry.xml"\r\n';
    newData += 'Content-Type: application/atom+xml\r\n';
    newData += '\r\n';
    newData += entryData;
    newData += '\r\n';

    for( var i=0; i<attachments.length; i++ )
    {
        newData += '--0.a.unique.value.0\r\n';
        newData += 'Content-Disposition: attachment; name="attachment"; filename="' + attachments[i].fileName + '"\r\n';
        newData += 'Content-Type: ' + attachments[i].contentType + '\r\n';
        newData += 'Content-Description: ' + attachments[i].description + '\r\n';
        newData += 'Content-Transfer-Encoding: base64\r\n';
        newData += '\r\n';
        newData += attachments[i].base64;
        newData += '\r\n';
    }
    newData += '--0.a.unique.value.0--\r\n';

    MASAS_postNewEntry( newData, 'multipart/related; boundary=0.a.unique.value.0' );
}

function MASAS_getEntries( options, callback_success, callback_fail )
{
    console.log( 'MASAS_getEntries' );

    MASAS_callback_getEntries_success = callback_success;
    MASAS_callback_getEntries_failure = callback_fail;

    var url = app_Settings.url + '/feed';

    if( options != undefined )
    {
        var params = '?';
        if( options.hasOwnProperty( 'geoFilter' ) )
        {
            params +=  options.geoFilter;
        }

        if( params.length > 1 )
        {
            url += params;
        }
    }

    var request = $.ajax({
        type: 'GET',
        url: url,
        headers: {
            'Authorization': 'MASAS-Secret ' + app_Settings.token
        },
        timeout: 120000
    });

    request.done( function( responseMsg ) {
        console.log( 'MASAS Entries successfully retrieved!' );

        if( MASAS_callback_getEntries_success && typeof( MASAS_callback_getEntries_success ) === "function" )
        {
            MASAS_callback_getEntries_success( responseMsg );
        }
    });

    request.fail( function(jqXHR, textStatus) {
        console.log( jqXHR );
        console.log( 'Fail status: ' + textStatus );

        var failureMsg = 'Failed to retrieve MASAS Entries! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
        console.log( failureMsg );
        alert( failureMsg );

        if( MASAS_callback_getEntries_failure && typeof( MASAS_callback_getEntries_failure ) === "function" )
        {
            MASAS_callback_getEntries_failure();
        }

    });
}

function MASAS_getAttachment( url, callback_success, callback_fail )
{
    console.log( 'MASAS_getAttachment' );

    MASAS_callback_getAttachment_success = callback_success;
    MASAS_callback_getAttachment_failure = callback_fail;

    var request = $.ajax({
        type: 'GET',
        url: url,
        headers: {
            'Authorization': 'MASAS-Secret ' + app_Settings.token
        },
        timeout: 120000
    });

    request.done( function( responseMsg ) {
        console.log( 'MASAS Entry attachment successfully retrieved!' );

        if( MASAS_callback_getAttachment_success && typeof( MASAS_callback_getAttachment_success ) === "function" )
        {
            MASAS_callback_getAttachment_success( responseMsg );
        }
    });

    request.fail( function(jqXHR, textStatus) {
        console.log( jqXHR );
        console.log( 'Fail status: ' + textStatus );

        var failureMsg = 'Failed to retrieve MASAS Entry attachment! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
        console.log( failureMsg );

        if( MASAS_callback_getAttachment_failure && typeof( MASAS_callback_getAttachment_failure ) === "function" )
        {
            MASAS_callback_getAttachment_failure();
        }

    });
}