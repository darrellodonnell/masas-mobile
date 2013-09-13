/**
 * MASAS Mobile - Application Core
 *
 * Independent Joint Copyright (c) 2013 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

$( document ).delegate("#Main", "pagebeforecreate", function( event, ui )
{
    // Hide the viewMASAS button if needed...
    if( app_isDeviceBB567() )
    {
        $( "#mainNav_viewMASAS" ).parent().remove();
        $( "#main_btnViewMASAS" ).remove();
    }
});

$( document ).delegate("#Main", "pagebeforeshow", function( event, ui )
{
    // NOTE: This will get called before Cordova is properly initialized!
    app_onCoverageChange();
});

$( document ).delegate("#app_dataStatus", "vclick", function(event, ui)
{
    if( app_hasDataCoverage() )
    {
        alert( "Data coverage is available!");
    }
    else
    {
        alert( "Data coverage is currently unavailable!");
    }

});
