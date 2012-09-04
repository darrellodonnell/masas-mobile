var frmShowImage_isReadOnly = true;

$( document ).delegate("#frmViewImage", "pagebeforecreate", function()
{
	frmShowImage_isReadOnly = true;
	if( currentReport.State != 'Sent' )
	{
		frmShowImage_isReadOnly = false;
	}
	
	$("#frmViewImage_MainImage").attr("src", currentImage);
	$("#frmViewImage_MainImage").css('width',"100%");
	$("#frmViewImage_MainImage").css('height',"100%");

	if( frmShowImage_isReadOnly )
	{
		$("#frmViewImage_btnDelete").attr("disabled", true);		
		$('#frmViewImage_btnDelete').hide();
	}
	
});

$( document ).delegate("#frmViewImage_btnBack", "vclick", function(event, ui)
{
	$.mobile.changePage( "frmReport.html", {} );
});
