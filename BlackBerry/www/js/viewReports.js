/**
 * MASAS Mobile - Report Overview Page
 * Updated: Oct 5, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#ViewReports", "pagebeforecreate", function() {
    reports_resetList();
    reports_loadReports();
});

$( document ).delegate("#ViewReports", "pagebeforeshow", function() {
    app_onCoverageChange();
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

    var itemHTML  = '<a>';
    itemHTML += '<div class="report_icon_wrapper">';
    itemHTML += '<img src="' + appGetSymbolPath( report.Symbol ) + '" style="max-width:48px;max-height:48px;" />';
    itemHTML += '</div>';
    itemHTML += '<h3>' + report.Title + '</h3>' + '<p><strong>' + report.Description + '</strong></p><div class="ui-li-aside"><p><strong>' + report.Updated.toDateString() + '</strong></p><p><strong>' + report.Updated.toLocaleTimeString() + '</strong></p></div></a>';

    listItem.innerHTML = itemHTML;

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
    if( $.mobile.activePage.attr('id') == 'ViewReports' )
    {
        var reportId = $(this).attr( 'data-masas-report-id' );

        if( reportId != undefined )
        {
            currentReport = localReports[reportId];

            if( currentReport != null )
            {
                $.mobile.changePage( "report.html" );
            }
            else
            {
                alert( 'Error: The selected report could not be found!' );
                reports_resetList();
                reports_loadReports();
            }
        }
    }
    else if( $.mobile.activePage.attr('id') == 'Report' )
    {
        var jsonStr = $(this).attr( 'data-masas-report-attachment' );

        if( jsonStr != undefined )
        {
            var attachment = JSON.parse( jsonStr.replace(/'/g, '"') );

            if( attachment != null )
            {
                viewAttachment( attachment );
            }
        }
    }
});
