/**
 * MASAS Mobile - Short Report Model
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASASMobile = MASASMobile || {};

MASASMobile.ShortReportModel = function()
{
    MASASMobile.EntryModel.call( this );

    this.confirmed  = false;
    this.masasEntry = new MASAS.Entry();
};

MASASMobile.ShortReportModel.prototype = Object.create( MASASMobile.EntryModel.prototype );