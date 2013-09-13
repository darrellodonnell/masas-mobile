/**
 * MASAS Mobile - MASAS helper functions
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASASMobile = MASASMobile || {};

MASASMobile.EntryManager = function()
{

    // Private members...

    // NOTE: the identifiers are current meant to be used during a runtime session, therefore the are reset
    //       every session. This may need to be changed to a UUID in the future.
    var nextId = 0;

    // Entries contained by this manager...
    var entries = [];

    this.CreateModel = function( masasEntry )
    {
        var entryModel = new MASASMobile.EntryModel();
        entryModel.identifier = this.GetNextIdentifier();

        if( masasEntry == undefined ) {
            entryModel.masasEntry = new MASAS.Entry();
        }
        else {
            entryModel.masasEntry = masasEntry;
        }

        return entryModel;
    };

    this.GetNextIdentifier = function()
    {
        return nextId++;
    };

    this.Count = function() {
        return entries.length;
    };

    this.AddEntry = function( entry )
    {
        if( entry.identifier == undefined ) {
            entry.identifier = this.GetNextIdentifier();
        }

        entries.push( entry );
    };

    this.RemoveEntry = function( entry )
    {
        for( var i = 0; i < entries.length; i++ )
        {
            if( entries[i].identifier == entry.identifier )
            {
                entries.splice( i, 1 );
                break;
            }
        }
    }

    this.GetEntry = function( index )
    {
        return entries[index];
    };

    this.GetEntryByIdentifier = function( identifier )
    {
        var retValue = undefined;

        for( var i = 0; i < entries.length; i++ )
        {
            if( entries[i].identifier == identifier )
            {
                retValue = entries[i];
                break;
            }
        }

        return retValue;
    };

    this.RemovePublishedEntries = function()
    {
        for( var i = entries.length - 1; i >= 0; i-- )
        {
            if( entries[i].state == MASASMobile.EntryStateEnum.published )
            {
                entries.splice( i, 1 );
            }
        }
    };

};