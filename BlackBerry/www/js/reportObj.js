/**
 * MASAS Mobile - Report Object Definition
 * Updated: Oct 5, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

function reportObj( obj )
{
    this.Symbol = 'ems.operations.emergency';
    this.Title = '';
    this.Description = '';
    this.State = 'Draft';  // States: Draft, Sent
    this.Created = new Date();
    this.Updated = new Date();
    this.Attachments = [];

    this.UseLocation = 'GPS'; // GPS, Lookup
    this.Location = undefined;

    // Lookup's Location structure...
    // { 'latitude': 0.0,
    //   'longitude': 0.0 }
    this.LookupLocation = { 'Location': undefined, 'Lookup': '' };

    // FileType: File, Image, Audio
    this.AddAttachment = function( type, filePath ) {
        var attachment = { Type: type, Path: filePath };
        this.Attachments.push( attachment );
        return attachment;
    }

    this.DeleteAttachment = function( filePath )
    {
        for( var i=0; i<this.Attachments.length; i++ )
        {
            if( this.Attachments[i].Path == filePath )
            {
                this.Attachments.splice( i, 1 );
                break;
            }
        }
    }

    // If an object was passed in, then initialise the properties with that object...
    // NOTE: This may not be the best way to do this, but it works!
    for( var prop in obj )
    {
        this[prop] = obj[prop];
    };

}

function shortReportObj( obj )
{
    this.Title = '';
    this.Description = '';
    this.Location = undefined;
}