/**
 * MASAS Mobile - Confirm Report Delete Page
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#confirmReportDelete_btnDelete", "vclick", function(event, ui)
{
    appLocalReports_removeReport( currentReport );
    currentReport = null;

    app_SaveData();
    $.mobile.changePage( "viewReports.html", {} );
});
