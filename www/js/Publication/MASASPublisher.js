/**
 * MASAS Mobile - MASAS Publisher
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASASMobile = MASASMobile || {};

MASASMobile.MASASPublisher = function()
{

    this.PublishEntry = function( entryModel, callback_success, callback_failure )
    {
        var peData = {
                entry: entryModel,
                callback_entryPublished: callback_success,
                callback_entryFailure: callback_failure,
                attachmentStatus: []
        };

        // Load the attachments as base64.  On success, the entry will be sent.
        LoadAttachmentsAsBASE64( peData, PublishEntry_LAB64_Success, PublishEntry_LAB64_Failure );
    };

    this.PublishReport = function( report, callback_success, callback_failure )
    {
        var publisher = this;

        // Convert Report to EntryModel...
        var entryModel = ConvertReportToEntryModel( report );

        // Publish as usual...
        publisher.PublishEntry( entryModel, callback_success, callback_failure );
    };

    this.PublishShortReport = function( shortReport, callback_success, callback_failure )
    {
        var publisher = this;

        var entryModel = ConvertShortReportToEntryModel( shortReport );

        publisher.PublishEntry( entryModel, callback_success, callback_failure );
    };

    this.CancelEntry = function( entryModel, callback_success, callback_failure ) {
        // Set the expires to now!
        entryModel.masasEntry.expires = new Date();

        // Update the entry....
        mmApp.masasHub.UpdateEntry( entryModel.masasEntry, callback_success, callback_failure );
    };

    /// Private methods....

    var PublishEntry_LAB64_Success = function( result )
    {
        console.log( 'Entry attachments have been converted to base64.' );

        // Send the entry to MASAS...
        if( result.entry.state == MASASMobile.EntryStateEnum.unpublished ) {
            mmApp.masasHub.CreateEntry( result.entry.masasEntry, result.callback_entryPublished, result.callback_entryFailure );
        }
        else {
            mmApp.masasHub.UpdateEntry( result.entry.masasEntry, result.callback_entryPublished, result.callback_entryFailure );
        }
    };

    var PublishEntry_LAB64_Failure = function( result, errorMsg )
    {
        console.log( 'Entry attachments could not be converted to base64.' );
        console.log( errorMsg );

        result.callback_entryFailure( errorMsg );
    };

    // Convert each attachment to BASE64
    var LoadAttachmentsAsBASE64 = function( data, callback_success, callback_failure )
    {
        var attachments = data.entry.masasEntry.attachments;

        if( attachments.length > 0 )
        {
            var i = 0;
            for( i = 0; i < attachments.length; i++ ) {
                // Setup the init values for the status codes...
                data.attachmentStatus.push( { statusCode: 0, statusMsg: '' } );
            }

            for( i = 0; i < attachments.length; i++ ) {
                // Load the Attachment as base64
                LoadAttachmentAsBASE64( i, data, callback_success, callback_failure );
            }
        }
        else
        {
            // No attachments, we are done...
            if( callback_success && typeof( callback_success ) === "function" )
            {
                callback_success( data );
            }
        }
    };

    // LoadAttachmentAsBASE64
    var LoadAttachmentAsBASE64 = function( index, data, callback_success, callback_failure )
    {
        var attachment = data.entry.masasEntry.attachments[index];
        var attStatus = data.attachmentStatus[index];

        console.log( 'Opening file: ' + attachment.uri );

        // First, resolve the path to get use the FileEntry for the file we need...
        window.resolveLocalFileSystemURI( attachment.uri,
            function( fileEntry ) // START resolveLocalFileSystemURI() Success callback
            {
                // We have a FileEntry, now we need the File!
                console.log( fileEntry.name + ' resolved.' );

                fileEntry.file(
                    function( file ) // START file() Success callback
                    {
                        // Create a FileReader...
                        var reader = new FileReader();

                        reader.onloadend =
                            function( evt ) // START reader.onloadend event callback
                            {
                                console.log( "readAsDataURL() success!" );

                                // We only need the actual base64 data, so remove the added text before the data...
                                var startPos = (evt.target.result).indexOf( ',' );

                                attachment.base64 = (evt.target.result).substr( startPos + 1 );
                                attStatus.statusCode = 1;
                                attStatus.statusMsg = "File loaded as BASE64.";

                                CheckIfAllAttachmentsLoaded( data, callback_success, callback_failure );
                            }; // END reader.onloadend event callback

                        // ******************************************************************************************
                        // IMPORTANT PATCH FOR BLACKBERRY WEBWORKS TABLET 2.2.0.5
                        //  The "reader.readAsDataURL()" call will not work without the patch!
                        //  There is a new "binary" option in the patch that needs to be used when converting from
                        //  a binary file to a base64 string.
                        //
                        //  See README - PlayBook.txt and follow the steps to patch your SDKs.
                        // ******************************************************************************************

                        // Read the file as BASE64...
                        reader.readAsDataURL( file );

                    }, // END File Success callback
                    function( evt ) // START File Failure callback
                    {
                        // Failed!
                        console.log( evt );
                        attStatus.statusCode = -1;
                        attStatus.statusMsg = "Failed: Could not resolve the File.";

                        CheckIfAllAttachmentsLoaded( data, callback_success, callback_failure );
                    } // END file() Failure callback
                );
            }, // END resolveLocalFileSystemURI() Success callback
            function( evt )  // START resolveLocalFileSystemURI() Failed callback
            {
                // Failed!
                console.log( evt );

                attStatus.statusCode = -1;
                attStatus.statusMsg = "Failed: Could not resolve the Local File System URI.";

                CheckIfAllAttachmentsLoaded( data, callback_success, callback_failure );
            } // END resolveLocalFileSystemURI() Failed callback
        );
    };

    var CheckIfAllAttachmentsLoaded = function( data, callback_success, callback_failure )
    {
        var attachments = data.entry.masasEntry.attachments;
        var attachmentStatus = data.attachmentStatus;

        var count = 0;
        var failed = false;
        var errorMsg = '';

        for( var i=0; i < attachmentStatus.length; i++ )
        {
            if( attachmentStatus[i].statusCode == -1 )
            {
                count++;
                failed = true;
                // TODO: this needs work!
                errorMsg += attachmentStatus[i].statusMsg + ' ';
            }
            else if( attachmentStatus[i].statusCode == 1 ) {
                count++;
            }
        }

        if( count == attachments.length )
        {
            // We are done...
            if( failed )
            {
                if( callback_failure && typeof( callback_failure ) === "function" ) {
                    callback_failure( data, errorMsg );
                }
            }
            else
            {
                if( callback_success && typeof( callback_success ) === "function" ) {
                    callback_success( data );
                }
            }
        }
        else {
            console.log( 'Only ' + count + ' attachments have been converted.' );
        }
    };

    var ConvertShortReportToEntryModel = function( shortReport )
    {
        var augmentedTitle = shortReport.masasEntry.GetTitle() + ' [' + app_Settings.vehicleId + ']';

        var entryModel = shortReport;

        entryModel.masasEntry.SetTitle( augmentedTitle );

        entryModel.masasEntry.status    = app_Settings.reportStatus;
        entryModel.masasEntry.icon      = app_GetSimpleReportIcon();
        entryModel.masasEntry.expires   = app_GetReportExpiration();

        var location = app_Settings.defaultLocation;
        if( shortReport.location != undefined && shortReport.location != null ) {
            location = shortReport.location;
        }

        entryModel.masasEntry.geometry = [];
        entryModel.masasEntry.geometry.push( { type: "point",
                                               data: location.latitude + " " + location.longitude
                                             } );

        return entryModel;
    };

    var ConvertReportToEntryModel = function( report )
    {
        var entryModel = mmApp.entryManager.CreateModel();

        var augmentedTitle = report.Title + ' [' + app_Settings.vehicleId + ']';

        entryModel.masasEntry.SetTitle( augmentedTitle );
        entryModel.masasEntry.SetContent( report.Description );

        entryModel.masasEntry.status    = app_Settings.reportStatus;
        entryModel.masasEntry.icon      = report.Symbol;
        entryModel.masasEntry.expires   = app_GetReportExpiration();


        // Default location...
        var location = app_Settings.defaultLocation;

        // Figure out the real location, if it exists...
        if( report.UseLocation == "GPS" ) {
            if( report.Location != undefined && report.Location != null ) {
                location = report.Location;
            }
        }
        else{
            if( report.LookupLocation.Location != undefined && report.LookupLocation.Location != null ) {
                location = report.LookupLocation.Location;
            }
        }

        entryModel.masasEntry.geometry.push( { type: "point",
                                               data: location.latitude + " " + location.longitude
                                             } );

        // setup the data up front so we don't have any data access problems...
        for( var i = 0; i < report.Attachments.length; i++ )
        {
            var attachment = new MASAS.Attachment();

            attachment.uri            = report.Attachments[i].Path;
            attachment.title          = report.Attachments[i].Path.replace( /^.*[\\\/]/, '' );
            attachment.contentType    = report.Attachments[i].Type;
            attachment.length         = undefined;

            entryModel.masasEntry.attachments.push( attachment );
        }

        return entryModel;
    };

};
