/**
 * MASAS Mobile - About Page
 * Updated: Oct 5, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var about_components = null;

$( document ).delegate("#about", "pagebeforecreate", function()
{
    $('#about_lblDescription').text( blackberry.app.description );
    $('#about_lblCopyright').text( blackberry.app.copyright );
    $('#about_lblVersion').text( "Version " + blackberry.app.version );
    $('#about_lblURL').text( blackberry.app.authorURL );
});

$( document ).delegate("#about", "pagebeforeshow", function( event, ui )
{
});

$( document ).delegate( "#about_btnMASASMobileLicense", "vclick", function( event )
{
    about_showTextLicense( "MASAS Mobile License", blackberry.app.license );
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
        var buttons = ["OK"];
        var ops = { title : licenseTitle, size : blackberry.ui.dialog.SIZE_TALL, position : blackberry.ui.dialog.CENTER };
        blackberry.ui.dialog.customAskAsync( license, buttons, about_dialogCallBack, ops );
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
