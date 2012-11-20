/**
 * MASAS Mobile - About Page
 * Updated: Nov 18, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var about_components = null;

$( document ).delegate("#about", "pagebeforecreate", function()
{
    // Load the meta data...
    $('#about_lblDescription').text( app.description );
    $('#about_lblCopyright').text( app.copyright );
    $('#about_lblVersion').text( "Version " + app.version );
    $('#about_lblURL').text( app.authorURL );
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
        if( app_isDeviceBlackBerry() )
        {
            // Use BlackBerry specific dialog...
            // NOTE: At time of implementation, the PhoneGap solution did not scroll big dialogs properly.
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
