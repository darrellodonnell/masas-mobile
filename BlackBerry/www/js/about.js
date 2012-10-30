/**
 * MASAS Mobile - About Page
 * Updated: Oct 30, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var about_components = null;

$( document ).delegate("#about", "pagebeforecreate", function()
{
    if( blackberry && blackberry.app )
    {
        // Load the data from the BlackBerry API (taken from config.xml).
        $('#about_lblDescription').text( blackberry.app.description );
        $('#about_lblCopyright').text( blackberry.app.copyright );
        $('#about_lblVersion').text( "Version " + blackberry.app.version );
        $('#about_lblURL').text( blackberry.app.authorURL );
    }
    else
    {
        // TODO: Add support to load this data from an external source.
        //       Cordova currently does not do this.
        $('#about_lblVersion' ).hide();
    }
});

$( document ).delegate("#about", "pagebeforeshow", function( event, ui )
{
});

$( document ).delegate( "#about_btnMASASMobileLicense", "vclick", function( event )
{
    about_showLicense( "MASAS Mobile License", "licenses/LICENSE.txt" );
});

$( document ).delegate( "#about_btnJQMLicense", "vclick", function( event )
{
    about_showLicense( "jQuery Mobile License", "licenses/jQuery/MIT-LICENSE.txt" );
});

$( document ).delegate( "#about_btnCordovaLicense", "vclick", function( event )
{
    about_showLicense( "Apache Cordova License", "licenses/Cordova/LICENSE" );
});

$( document ).delegate( "#about_btnOSMLicense", "vclick", function( event )
{
    about_showLicense( "OpenStreetMap License", "licenses/OSM/odbl-10.txt" );
});

$( document ).delegate( "#about_btnEMSSymbolsLicense", "vclick", function( event )
{
    about_showLicense( "Emergency Mapping Symbology License", "licenses/EMS/LICENCE.txt" );
});

function about_showTextLicense( licenseTitle, license )
{
    try
    {
        if( blackberry && blackberry.ui )
        {
            // Use BlackBerry specific dialog...
            var buttons = ["OK"];
            var ops = { title : licenseTitle, size : blackberry.ui.dialog.SIZE_TALL };
            blackberry.ui.dialog.customAskAsync( license, buttons, about_dialogCallBack, ops );
        }
        else
        {
            // Use the Cordova dialog...
            navigator.notification.confirm( license, about_dialogCallBack, licenseTitle, "OK" );
        }
    }
    catch( e )
    {
        alert( "Exception in Dialog: " + e );
    }
}

function about_dialogCallBack( selectedButtonIndex )
{
}

function about_showLicense( title, licenseURL )
{
    var request = $.ajax({
        type: 'GET',
        url: licenseURL,
        timeout: 120000
    });

    request.done( function( msg ) {
        console.log( msg );
        license = msg;
        about_showTextLicense( title, license );
    });

    request.fail( function(jqXHR, textStatus) {
        var failureMsg = 'License retrieval failed! ' + jqXHR.statusText + ': ' + jqXHR.responseText;
        console.log( failureMsg );
        alert( failureMsg );

    });
}
