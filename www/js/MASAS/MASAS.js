/**
 * MASAS library
 * Updated: Dec 17, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASAS = MASAS || {};

///
/// MASAS Hub object
///
MASAS.Hub = function()
{

    /// Public Members

    this.userData = undefined;

    /// Public Methods

    this.CreateEntry = function( entry, callback_success, callback_fail )
    {
        var postData = '<?xml version="1.0" encoding="UTF-8"?>';
        postData += entry.ToXML();

        if( "attachments" in entry && entry.attachments.length > 0 )
        {
            PostNewEntryWithAttachments( postData, entry.attachments, callback_success, callback_fail );
        }
        else
        {
            PostNewEntry( postData, 'application/atom+xml', callback_success, callback_fail );
        }
    };

    this.UpdateEntry = function( entry, callback_success, callback_fail )
    {
        var postData = '<?xml version="1.0" encoding="UTF-8"?>';
        postData += entry.ToXML();

        var editUrl = entry.GetLink( "edit" );

        PutUpdateEntry( editUrl, postData, callback_success, callback_fail )
    };

    this.GetEntries = function( options, callback_success, callback_fail )
    {
        console.log( 'GetEntries' );

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

            var entries = GetEntriesFromFeed( responseMsg );

            if( callback_success && typeof( callback_success ) === "function" )
            {
                callback_success( responseMsg, entries );
            }
        });

        request.fail( function(jqXHR, textStatus) {
            console.log( jqXHR );
            console.log( 'Fail status: ' + textStatus );

            var failureMsg = 'Failed to retrieve MASAS Entries! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
            console.log( failureMsg );

            if( callback_fail && typeof( callback_fail ) === "function" )
            {
                callback_fail( failureMsg );
            }

        });
    };

    this.GetAttachment = function( url, callback_success, callback_fail )
    {
        console.log( 'GetAttachment' );

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

            if( callback_success && typeof( callback_success ) === "function" )
            {
                callback_success( responseMsg );
            }
        });

        request.fail( function(jqXHR, textStatus) {
            console.log( jqXHR );
            console.log( 'Fail status: ' + textStatus );

            var failureMsg = 'Failed to retrieve MASAS Entry attachment! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
            console.log( failureMsg );

            if( callback_fail && typeof( callback_fail ) === "function" )
            {
                callback_fail();
            }

        });
    };

    this.RefreshUserData = function( callback_success, callback_fail )
    {
        console.log( 'GetUserData' );

        var masasObj = this;

        // Easy way to get the domainName...
        var a = document.createElement( 'a' );
        a.href = app_Settings.url;

        // Remove the first part of the domain name, since we are going to replace it...
        var domainName = a.host.substr( a.host.indexOf( '.' ) + 1 );

        // Create the access url...
        var url = 'https://access.' + domainName + '/api/check_access/?query_secret=' + app_Settings.token;

        var request = $.ajax({
            type: 'GET',
            url: url,
            headers: {
                'Authorization': 'MASAS-Secret ' + app_Settings.token
            },
            timeout: 120000
        });

        request.done( function( responseMsg ) {
            console.log( 'MASAS User data successfully retrieved!' );

            masasObj.userData = responseMsg;

            if( callback_success && typeof( callback_success ) === "function" )
            {
                callback_success( masasObj.userData );
            }
        });

        request.fail( function(jqXHR, textStatus) {
            console.log( jqXHR );
            console.log( 'Fail status: ' + textStatus );

            var failureMsg = 'Failed to retrieve MASAS User data! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
            console.log( failureMsg );

            if( callback_fail && typeof( callback_fail ) === "function" )
            {
                callback_fail( failureMsg );
            }

        });
    };

    /// Private methods

    var GetEntriesFromFeed = function( xmlFeed )
    {
        var entries = [];

        $feedEntries = $(xmlFeed).find( "entry" );

        for( var entryCtr = 0; entryCtr < $feedEntries.length; entryCtr++ )
        {
            var newEntry = new MASAS.Entry();
            newEntry.FromNode( $feedEntries[entryCtr] );

            entries.push( newEntry );
        }

        return entries;
    };

    var GetEntryFromResponse = function( xmlResponse )
    {
        var entry = undefined;

        $feedEntry = $(xmlResponse).find( "entry" );

        if( $feedEntry.length > 0 )
        {
            entry = new MASAS.Entry();
            entry.FromNode( $feedEntry[0] );
        }

        return entry;
    };

    var PostNewEntry = function( entryData, contentType, callback_success, callback_fail )
    {
        console.log( 'PostNewEntry' );
        PostEntry( "POST", app_Settings.url + '/feed', contentType, entryData, callback_success, callback_fail)
    };

    var PostNewEntryWithAttachments = function( entryData, attachments, callback_success, callback_fail )
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
            newData += 'Content-Disposition: attachment; name="attachment"; filename="' + attachments[i].title + '"\r\n';
            newData += 'Content-Type: ' + attachments[i].contentType + '\r\n';
            //newData += 'Content-Description: ' + attachments[i].description + '\r\n';
            newData += 'Content-Transfer-Encoding: base64\r\n';
            newData += '\r\n';
            newData += attachments[i].base64;
            newData += '\r\n';
        }
        newData += '--0.a.unique.value.0--\r\n';

        PostNewEntry( newData, 'multipart/related; boundary=0.a.unique.value.0', callback_success, callback_fail );
    };

    var PutUpdateEntry = function( editUrl, postData, callback_success, callback_fail )
    {
        console.log( 'PostUpdateEntry' );

        PostEntry( "PUT", editUrl, "application/atom+xml;type=entry", postData, callback_success, callback_fail)
    };

    var PostEntry = function( type, url, contentType, entryData, callback_success, callback_fail )
    {
        console.log( 'PostEntry' );

        var request = $.ajax({
            type: type,
            url: url,
            headers: {'Content-Type': contentType,
                'Authorization': 'MASAS-Secret ' + app_Settings.token },
            data: entryData,
            timeout: 120000
        });

        request.done( function(msg) {
            console.log(msg);
            console.log('Posted to MASAS Hub successfully!');

            if( callback_success && typeof( callback_success ) === "function" )
            {
                var entry = GetEntryFromResponse( msg );
                callback_success( msg, entry );
            }
        });

        request.fail( function(jqXHR, textStatus) {
            console.log( jqXHR );
            console.log( 'Fail status: ' + textStatus );

            var failureMsg = 'Posting failed! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
            console.log( failureMsg );

            if( callback_fail && typeof( callback_fail ) === "function" )
            {
                callback_fail( failureMsg );
            }

        });
    };

};
