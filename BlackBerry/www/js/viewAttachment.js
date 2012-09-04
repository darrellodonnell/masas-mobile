var viewAttachment_isReadOnly = true;

$( document ).delegate("#viewAttachment", "pagebeforecreate", function()
{
    viewAttachment_isReadOnly = true;
	if( currentReport.State != 'Sent' )
	{
        viewAttachment_isReadOnly = false;
	}
	$("#viewAttachment_Header").text( currentAttachment.Path.replace(/^.*[\\\/]/, '') );

    $("#viewAttachment_previewImage").hide();
    $("#viewAttachment_previewAudio").hide();
    $("#viewAttachment_unknown").hide();

    if( currentAttachment.Type.indexOf( 'image' ) != -1 )
    {
        $("#viewAttachment_previewImage").attr("src", currentAttachment.Path);
        $("#viewAttachment_previewImage").show();
    }
    else if( currentAttachment.Type.indexOf( 'audio' ) != -1 )
    {
        $("#viewAttachment_previewAudio").attr("src", currentAttachment.Path);
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
