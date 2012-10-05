/**
 * MASAS Mobile - Confirm Report Delete Page
 * Updated: Oct 5, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#confirmReportDelete_btnDelete", "vclick", function(event, ui)
{
    appLocalReports_removeReport( currentReport );
    currentReport = null;

    appSaveData();
    $.mobile.changePage( "viewReports.html", {} );
});
