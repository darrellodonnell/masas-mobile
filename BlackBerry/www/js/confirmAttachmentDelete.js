
$( document ).delegate("#confirmAttachmentDelete_btnDelete", "vclick", function(event, ui)
{
    currentReport.DeleteAttachment( currentAttachment.Path );
    currentAttachment = null;
    appSaveData();

    $.mobile.changePage( "report.html", {} );
});
