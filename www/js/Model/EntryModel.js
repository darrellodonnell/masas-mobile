/**
 * MASAS Mobile - MASAS Entry Model
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASASMobile = MASASMobile || {};

MASASMobile.EntryStateEnum = { unpublished: 0, published: 1 };

MASASMobile.EntryModel = function()
{

    this.identifier = undefined;
    this.state      = MASASMobile.EntryStateEnum.unpublished;
    this.masasEntry = undefined;
    this.location   = app_Settings.defaultLocation;

    this.IsReadOnly = function()
    {
        var userUri = "";

        if( mmApp.masasHub.userData != undefined ) {
            userUri = mmApp.masasHub.userData.uri;
        }

        return !( ( this.state == MASASMobile.EntryStateEnum.unpublished ) ||
                  ( this.masasEntry.author.uri == userUri ) );
    }

};