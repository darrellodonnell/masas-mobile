$( document ).delegate("#Reports", "pagebeforecreate", function() {
	reports_resetList();
	reports_loadReports();
});

function reports_resetList()
{
	// Remove all the <li> with containing the 'data-masas-report-id' attribute from the list.
	$('#lstReports').children().remove( 'li[data-masas-report-id]' );
}

function reports_loadReports()
{
	// Counters for the groups
	var pending = 0, sent = 0;
	
	// Add the reports...
	if( localReports != null && localReports.length > 0 )
	{
		for( var i=0; i<localReports.length; i++ )
		{
			if( localReports[i].State == 'Draft' ) {
				reports_addListItem( 'lstReportsPending', i, localReports[i] );
				pending++;
			}
			else
			{
				reports_addListItem( 'lstReportsSent', i, localReports[i] );
				sent++;
			}
		}
		
		$('#lstReportPendingCount').text( pending );
		$('#lstReportSentCount').text( sent );
	}
}

function reports_addListItem( listId, reportIdentifier, report )
{
	var listItem, dataListHeader = document.getElementById( listId );
	var dataList = dataListHeader.parentNode;
	
	// Create our list item
	listItem = document.createElement('li');
	listItem.setAttribute( 'data-masas-report-id', reportIdentifier );
	listItem.innerHTML = '<a><h3>' + report.Title + '</h3>' + '<p><strong>' + report.Description + '</strong></p><div class="ui-li-aside"><p><strong>' + report.Updated.toDateString() + '</strong></p><p><strong>' + report.Updated.toLocaleTimeString() + '</strong></p></div></a>';

	// Append the item
	dataList.insertBefore( listItem, dataListHeader.nextSibling );
}

$( document ).delegate("span .ui-icon", "vclick", function(event, ui)
{
	var path = $(this).attr( 'data-masas-report-attachment' );
	
	if( path != undefined )
	{
		//currentReport.removeAttachment( path );
	}

});

$( document ).delegate("li", "vclick", function(event, ui)
{
	var reportId = $(this).attr( 'data-masas-report-id' );
	var path = $(this).attr( 'data-masas-report-attachment' );
	
	if( path != undefined )
	{
		viewPicture( path );
	}
	
	if( reportId != undefined )
	{
		currentReport = localReports[reportId];
		
		if( currentReport != null )
		{
			$.mobile.changePage( "frmReport.html" );
		}
		else
		{
			alert( 'Error: The selected report could not be found!' );
			reports_resetList();
			reports_loadReports();
		}
	}
	
});
