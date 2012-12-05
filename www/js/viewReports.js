/**
 * MASAS Mobile - Report Overview Page
 * Updated: Dec 04, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#ViewReports", "pagebeforecreate", function()
{
    // Hide the viewMASAS button if needed...
    if( app_isDeviceBB567() )
    {
        $( "#mainNav_viewMASAS" ).parent().remove();
    }

    reports_resetList();
    reports_loadReports();
});

$( document ).delegate("#ViewReports", "pagebeforeshow", function()
{
    app_onCoverageChange();
});

function reports_resetList()
{
    // Remove all the <li> with containing the 'data-masas-report-id' attribute from the list.
    $('#lstReports').children().remove( 'li[data-masas-report-id]' );
}

function reports_loadReports( selectionId )
{
    // Counters for the groups
    var pending = 0, sent = 0;

    // Add the reports...
    if( localReports != null && localReports.length > 0 )
    {
        for( var i=0; i<localReports.length; i++ )
        {
            var selected = (i == selectionId);
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
    itemHTML += '<img src="' + app_GetSymbolPath( report.Symbol ) + '" style="max-width:48px;max-height:48px;" />';
    itemHTML += '</div>';
    itemHTML += '<h3>' + report.Title + '</h3>' + '<p><strong>' + report.Description + '</strong></p><div class="ui-li-aside"><p><strong>' + report.Updated.toDateString() + '</strong></p><p><strong>' + report.Updated.toLocaleTimeString() + '</strong></p></div></a>';

    listItem.innerHTML = itemHTML;

    // Append the item
    dataList.insertBefore( listItem, dataListHeader.nextSibling );
}

$( document ).delegate( "li[data-masas-report-id]", "vclick", function( event )
{
    var reportId = $(this).attr( 'data-masas-report-id' );

    if( reportId != undefined )
    {
        currentReport = localReports[reportId];

        if( currentReport != null )
        {
            if( $("#viewReport_rightPanel").css("display") == "none" )
            {
                // Small screen... open the report in a separate page...
                $.mobile.changePage( "report.html" );
            }
            else
            {
                // Large Screen... open the report in a second column...
                viewReports_selectListItem( reportId );

                $("#Report").load( "report.html div[data-role='content']", function()
                {
                    $(this).trigger("create");
                });
            }
        }
        else
        {
            alert( 'Error: The selected report could not be found!' );
            reports_resetList();
            reports_loadReports();
        }
    }
});

function viewReports_selectListItem( selectionId )
{
    var liCurSelect = $("li[class*='ui-masas-list-item-selected']");

    if( liCurSelect.length > 0 )
    {
        liCurSelect.removeClass( "ui-masas-list-item-selected" );
    }

    var liToSelect = $("li[data-masas-report-id='" + selectionId + "']");
    liToSelect.addClass( "ui-masas-list-item-selected" );

    $("#lstReports").listview("refresh");
}
