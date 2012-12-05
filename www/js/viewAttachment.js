/**
 * MASAS Mobile - View Attachment Page
 * Updated: Dec 04, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var viewAttachment_isReadOnly = true;
var viewAttachment_currentAttachment = null;

$( document ).delegate("#viewAttachment", "pagebeforecreate", function()
{
    viewAttachment_isReadOnly = true;
    if( currentReport.State != 'Sent' )
    {
        viewAttachment_isReadOnly = false;
    }
    $("#viewAttachment_Header").text( viewAttachment_currentAttachment.Path.replace(/^.*[\\\/]/, '') );

    $("#viewAttachment_previewImage").hide();
    $("#viewAttachment_previewAudio").hide();
    $("#viewAttachment_unknown").hide();

    if( viewAttachment_currentAttachment.Type.indexOf( 'image' ) != -1 )
    {
        $("#viewAttachment_previewImage").attr("src", viewAttachment_currentAttachment.Path);
        $("#viewAttachment_previewImage").show();
    }
    else if( viewAttachment_currentAttachment.Type.indexOf( 'audio' ) != -1 )
    {
        $("#viewAttachment_previewAudio").attr("src", viewAttachment_currentAttachment.Path);
        $("#viewAttachment_previewAudio").show();
    }
    else
    {
        $("#viewAttachment_unknown").show();
    }

    if( viewAttachment_isReadOnly )
    {
        $('#viewAttachment_btnDelete').parent().remove();
    }

});

$( document ).delegate("#viewAttachment_btnBack", "vclick", function(event, ui)
{
    $.mobile.changePage( "report.html", {} );
});
