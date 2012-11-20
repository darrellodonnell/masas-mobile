/**
 * MASAS Mobile - Menu Management
 * Updated: Oct 30, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

function menu_initMenu()
{
    if( app_isDeviceBB567() )
    {
        //create MenuItem objects:
        //
        //   @param isSeparator (Boolean) - true/false whether this item is a menu separator
        //   @param ordinal (Number) - specifies sort order within the menu.  Lower ordinal values have higher position in menu.
        //   @param caption (String) - text to be displayed in menu for this menu item.
        //   @param iscallback (OnClick) - JavaScript function name to be called when user selects this menu item.
        //

        var existingItems = blackberry.ui.menu.getMenuItems();

        var homeItem = new blackberry.ui.menu.MenuItem( false, 1, "Home", menu_homeMenuItemClick );
        var reportsItem = new blackberry.ui.menu.MenuItem( false, 2, "Reports", menu_reportsMenuItemClick );
        var settingsItem = new blackberry.ui.menu.MenuItem( false, 3, "Settings", menu_settingsMenuItemClick );
        var separatorItemNav = new blackberry.ui.menu.MenuItem( true, 4 );
        var aboutItem = new blackberry.ui.menu.MenuItem( false, 5, "About", menu_aboutMenuItemClick );
        var separatorItemBB = new blackberry.ui.menu.MenuItem( true, 6 );

        blackberry.ui.menu.clearMenuItems();

        blackberry.ui.menu.addMenuItem( homeItem );
        blackberry.ui.menu.addMenuItem( reportsItem );
        blackberry.ui.menu.addMenuItem( settingsItem );
        blackberry.ui.menu.addMenuItem( separatorItemNav );
        blackberry.ui.menu.addMenuItem( aboutItem );
        blackberry.ui.menu.addMenuItem( separatorItemBB );

        blackberry.ui.menu.setDefaultMenuItem( homeItem );
    }
}

function menu_homeMenuItemClick()
{
    $.mobile.changePage( "index.html" );
}

function menu_reportsMenuItemClick()
{
    $.mobile.changePage( "viewReports.html" );
}

function menu_settingsMenuItemClick()
{
    $.mobile.changePage( "settings.html" );
}

function menu_aboutMenuItemClick()
{
    $.mobile.changePage( "about.html" );
}
