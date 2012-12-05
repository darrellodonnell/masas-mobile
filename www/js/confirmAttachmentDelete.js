/**
 * MASAS Mobile - Confirm Attachment Delete Page
 * Updated: Dec 04, 2012
 * Independent Joint Copyright (c) 2011-2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#confirmAttachmentDelete_btnDelete", "vclick", function(event, ui)
{
    currentReport.DeleteAttachment( viewAttachment_currentAttachment.Path );
    viewAttachment_currentAttachment = null;
    app_SaveData();

    $.mobile.changePage( "report.html", {} );
});
