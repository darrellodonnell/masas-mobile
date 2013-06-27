/**
 * MASAS - Entry Model object definition
 * Updated: Dec 18, 2012
 * Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
 * under the Modified BSD license.  See license.txt for the full text of the license.
 */

var MASAS = MASAS || {};

MASAS.Author = function()
{
    this.name = "";
    this.uri = "";
};

MASAS.Attachment = function()
{
    this.uri            = '';
    this.title          = '';
    this.contentType    = '';
    this.length         = 0;
    this.base64         = undefined;
};

MASAS.Entry = function()
{
    // Private members...
    var node = undefined;

    // Public members...
    this.identifier = undefined;

    this.languages = [];

    this.title = {};    // Use language as the lookup key.
    this.content = {};
    this.summary = {};

    this.icon       = 'ems.other.other';
    this.status     = 'Test';
    this.severity   = undefined;
    this.certainty  = undefined;
    this.categories = [];

    this.published  = undefined;
    this.updated    = undefined;
    this.expires    = undefined;

    this.attachments = [];

    this.geometry = [];

    this.author = new MASAS.Author();

    this.GetTitle = function( lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        return this.title[lang];
    };

    this.SetTitle = function( title, lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        this.title[lang] = title;
    };

    this.GetContent = function( lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        return this.content[lang];
    };

    this.SetContent = function( content, lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        this.content[lang] = content;
    };

    this.GetSummary = function( lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        return this.summary[lang];
    };

    this.SetSummary = function( summary, lang )
    {
        if( lang == undefined ) {
            lang = this.GetDefaultLanguage();
        }

        this.summary[lang] = summary;
    };

    this.AddLanguage = function( lang )
    {
        var exists = false;
        for( var i = 0; i < this.languages.length; i++ )
        {
            if( this.languages[i] == lang ) {
                exists = true;
                break;
            }
        }

        if( !exists ) {
            this.languages.push( lang );
        }
    };

    this.GetDefaultLanguage = function()
    {
        var defaultValue = 'en';

        if( this.languages.length > 0 ) {
            defaultValue = this.languages[0];
        }
        else {
            // no languages, add "en" as default.
            this.languages.push( defaultValue );
        }

        return defaultValue;
    };

    this.GetLink = function( rel )
    {
        var retValue = "";

        if( node != undefined ) {
            retValue = $(node).find( "link[rel='"+ rel +"']" ).attr( "href" );
        }

        return retValue;
    };

    this.AddAttachment = function( attachment )
    {
        this.attachments.push( attachment );
    };

    this.RemoveAttachment = function( attachment )
    {
        var retValue = false;

        for( var i=0; i<this.attachments.length; i++ )
        {
            if( this.attachments[i].uri == attachment.uri )
            {
                this.attachments.splice( i, 1 );
                retValue = true;
                break;
            }
        }

        return retValue;
    }

    this.FromNode = function( entryNode )
    {
        // reset the languages...
        this.languages = [];

        // Keep a copy of the original node...
        node = $(entryNode).clone();

        // Let's populate the <span> with data...
        this.identifier = $(node).find( "id" ).text();

        this.author.name = $(node).find( "author > name" ).text();
        this.author.uri = $(node).find( "author > uri" ).text();

        var titles = $(node).find( "title div[xml\\:lang]" );
        for( var titleCtr = 0; titleCtr < titles.length; titleCtr++ )
        {
            var lang = $( titles[titleCtr] ).attr( "xml:lang" );
            this.AddLanguage( lang );
            this.title[lang] = $( titles[titleCtr] ).text();
        }

        var contents = $(node).find( "content div[xml\\:lang]" );
        for( var contentCtr = 0; contentCtr < contents.length; contentCtr++ )
        {
            var lang = $( contents[contentCtr] ).attr( "xml:lang" );
            this.AddLanguage( lang );
            this.content[lang] = $( contents[contentCtr] ).text();
        }

        var summaries = $(node).find( "summary div[xml\\:lang]" );
        for( var summaryCtr = 0; summaryCtr < summaries.length; summaryCtr++ )
        {
            var lang = $( summaries[summaryCtr] ).attr( "xml:lang" );
            this.AddLanguage( lang );
            this.summary[lang] = $( summaries[summaryCtr] ).text();
        }

        // Single Categories...
        this.status = $(node).find( "category[scheme='masas:category:status']" ).attr( "term" );

        this.icon = ConvertIcon_PubToInternal( $(node).find( "category[scheme='masas:category:icon']" ).attr( "term" ) );

        var certainty = $(node).find( "category[scheme='masas:category:certainty']" );
        if( certainty.length > 0 ) {
            this.certainty = $(certainty).attr( "term" );
        }
        else {
            this.certainty = undefined;
        }

        var severity = $(node).find( "category[scheme='masas:category:severity']" );
        if( severity.length > 0 ) {
            this.severity = $(severity).attr( "term" );
        }
        else {
            this.severity = undefined;
        }

        // Multiple Categories...
        var categories = $(node).find( "category[scheme='masas:category:category']" );
        for( var catCtr = 0; catCtr < categories.length; catCtr++ ) {
            this.categories.push( $(categories[catCtr] ).attr( "term" ) );
        }

        // Date/Time stamps...
        this.published  = new Date( $(node).find( "published" ).text() );
        this.updated    = new Date( $(node).find( "updated" ).text() );

        this.expires    = new Date( $(node).find('expires, age\\:expires').text() ); // have to escape and use namespace\:element

        // Geometry...
        var geometry = $(node).find( "point, polygon, line, box, georss\\:line, georss\\:point, georss\\:polygon" );
        for( var geoCtr = 0; geoCtr < geometry.length; geoCtr++ ) {
            this.geometry.push( { "type": geometry[0].localName, "data": $(geometry[0]).text() } );
        }

        // Attachments...
        var attachments = $(node).find( "link[rel='enclosure']" );

        for( var attachCtr = 0; attachCtr < attachments.length; attachCtr++ )
        {
            var attachment = new MASAS.Attachment();

            attachment.uri            = $(attachments[attachCtr]).attr( "href" );
            attachment.title          = $(attachments[attachCtr]).attr( "title" );
            attachment.contentType    = $(attachments[attachCtr]).attr( "type" );
            attachment.length         = $(attachments[attachCtr]).attr( "length" );

            this.attachments.push( attachment );
        }
    };

    this.ToXML = function()
    {
        var entry = this;
        var entryXmlString = "";

        if( node == undefined ) {
            entryXmlString = GenerateXML( entry );
        }
        else
        {
            var updatedNode = UpdateNode( entry );

            var xmlSerializer = new XMLSerializer();
            entryXmlString = xmlSerializer.serializeToString( updatedNode[0] );
        }

        return entryXmlString;
    };

    /// Private methods

    var GenerateXML = function( entry )
    {
        var xmlEntry = '';

        xmlEntry += '<entry xmlns="http://www.w3.org/2005/Atom">';

        for( var iCat = 0; iCat < entry.categories.length; iCat++ ) {
            xmlEntry += '<category label="Category" scheme="masas:category:category" term="' + entry.categories[iCat] + '"/>';
        }

        xmlEntry += '<category label="Status" scheme="masas:category:status" term="' + entry.status + '"/>';
        xmlEntry += '<category label="Icon" scheme="masas:category:icon" term="' + ConvertIcon_InternalToPub( entry.icon ) + '"/>';

        if( entry.certainty != undefined ) {
            xmlEntry += '<category label="Certainty" scheme="masas:category:certainty" term="' + entry.certainty + '"/>';
        }

        if( entry.severity != undefined ) {
            xmlEntry += '<category label="Severity" scheme="masas:category:severity" term="' + entry.severity + '"/>';
        }

        var iLangCtr = 0;
        xmlEntry += '<title type="xhtml">';
        xmlEntry += '<div xmlns="http://www.w3.org/1999/xhtml">';
        for( iLangCtr = 0; iLangCtr < entry.languages.length; iLangCtr++ ) {
            xmlEntry += '<div xml:lang="'+ entry.languages[iLangCtr] +'">' + entry.GetTitle( entry.languages[iLangCtr] ) + '</div>';
        }
        xmlEntry += '</div>';
        xmlEntry += '</title>';

        xmlEntry += '<content type="xhtml">';
        xmlEntry += '<div xmlns="http://www.w3.org/1999/xhtml">';
        for( iLangCtr = 0; iLangCtr < entry.languages.length; iLangCtr++ ) {
            xmlEntry += '<div xml:lang="'+ entry.languages[iLangCtr] +'">' + entry.GetContent( entry.languages[iLangCtr] ) + '</div>';
        }
        xmlEntry += '</div>';
        xmlEntry += '</content>';

        if( entry.GetSummary() && entry.GetSummary().length > 0 )
        {
            xmlEntry += '<summary type="xhtml">';
            xmlEntry += '<div xmlns="http://www.w3.org/1999/xhtml">';
            for( iLangCtr = 0; iLangCtr < entry.languages.length; iLangCtr++ ) {
                xmlEntry += '<div xml:lang="'+ entry.languages[iLangCtr] +'">' + entry.GetSummary( entry.languages[iLangCtr] ) + '</div>';
            }
            xmlEntry += '</div>';
            xmlEntry += '</summary>';
        }

        if( entry.expires != undefined ) {
            xmlEntry += '<expires xmlns="http://purl.org/atompub/age/1.0">' + entry.expires.toISOString() + '</expires>';
        }

        for( var iGeo = 0; iGeo < entry.geometry.length; iGeo++ ) {
            xmlEntry += '<' + entry.geometry[iGeo].type + ' xmlns="http://www.georss.org/georss">' + entry.geometry[iGeo].data + '</' + entry.geometry[iGeo].type + '>';
        }

        xmlEntry += '</entry>';

        return xmlEntry;
    };

    var UpdateNode = function( entry )
    {
        // Generate a new node with the current info...
        var xml = GenerateXML( entry );
        var xmlDoc = $.parseXML( xml );
        var newEntryNode = $( xmlDoc ).find( "entry" );

        // Create a target node using the existing node.
        var mergedNode = $(node).clone();

        // Clear out the entries that exists in the newEntryNode...
        $(mergedNode).children().each( function( index, element )
        {
            var curNode = $(this);

            // Find the current element in the "NEW" node...
            var foundNodes = $(newEntryNode).find( element.localName );
            if( $(foundNodes).length > 0 )
            {
                // If they exists in the "NEW" node, remove them from this one...
                $(curNode).each( function( index ) {
                    $(this).remove();
                });
            }
        });

        // Merge the new node to the target node...
        $( newEntryNode ).children().appendTo( $( mergedNode ) );

        return mergedNode;
    };

    var ConvertIcon_InternalToPub = function( icon )
    {
        var returnVal = "";

        if( icon == "ems.other.other" || icon == "ems/other/other" )
        {
            returnVal = "other";
        }
        else
        {
            returnVal = icon.replace(/\./g, "/" );
        }

        return returnVal;
    };

    var ConvertIcon_PubToInternal = function( icon )
    {
        var returnVal = "";

        if( icon == undefined || icon == "other" )
        {
            returnVal = "ems.other.other";
        }
        else if( icon == "ems/incident/meteorological/snowfall" ) {
            returnVal = "ems.incident.meteorological.snowFall";
        }
        else if( icon == "ems/incident/meteorological/rainfall" ) {
            returnVal = "ems.incident.meteorological.rainFall";
        }
        else
        {
            returnVal = icon.replace(/\//g, "." );
        }

        return returnVal;
    };

};
