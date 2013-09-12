<?xml version="1.0" encoding="UTF-8"?>
<!--
MASAS - XML TO CAP V1.1 XSL
Updated: Dec 17, 2012
Independent Joint Copyright (c) 2012 MASAS Contributors.  Published
under the Modified BSD license.  See license.txt for the full text of the license.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cap="urn:oasis:names:tc:emergency:cap:1.1"
                xmlns:clitype="clitype"
                xmlns:fn="http://www.w3.org/2005/xpath-functions"
                xmlns:link="http://www.xbrl.org/2003/linkbase"
                xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" exclude-result-prefixes=" cap clitype fn link xlink xs xsi">
    <xsl:output version="4.0" method="html" indent="no" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd"/>
    <xsl:variable name="XML" select="/"/>

    <!-- Title Text -->
    <xsl:template name="TitleText">
        <!-- {scope} {status} {msgType} -->

        <xsl:for-each select="cap:scope">
            <xsl:apply-templates/>
        </xsl:for-each>
        <xsl:text> </xsl:text>
        <xsl:for-each select="cap:status">
            <xsl:apply-templates/>
        </xsl:for-each>
        <xsl:text> </xsl:text>
        <xsl:for-each select="cap:msgType">
            <xsl:apply-templates/>
        </xsl:for-each>

    </xsl:template>

    <!-- basic header area - identifier, sender, date sent -->
    <xsl:template name="HeaderBlock">
        <div class="TemplateDisplayBox">
            <table border="0">
                <tbody>
                    <xsl:for-each select="cap:identifier">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Identifier:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:sender">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Sender:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:sent">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Sent:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                </tbody>
            </table>
        </div>
    </xsl:template>

    <xsl:template match="/">
        <!--<title/>-->
        <style type="text/css">
            .TemplateDisplayBox { margin: 5px; padding: 5px; border: 1px solid black; }
        </style>

        <xsl:for-each select="cap:alert">
            <h1>
                <span>
                    <xsl:call-template name="TitleText"/>
                </span>
            </h1>
            <xsl:call-template name="HeaderBlock"></xsl:call-template>

            <xsl:for-each select="cap:info">

                <xsl:call-template name="InfoBlock"/>

            </xsl:for-each>

            <table border="0">
                <tbody>
                    <xsl:for-each select="cap:code">
                        <tr>
                            <td style="text-align:left; width:auto; " align="left" valign="top">
                                <span>
                                    <b><xsl:text>Code:</xsl:text></b>
                                </span>
                            </td>
                            <td style="width:6.25in; ">
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:note">
                        <tr>
                            <td style="text-align:left; width:auto; " align="left" valign="top">
                                <span>
                                    <b><xsl:text>Note:</xsl:text></b>
                                </span>
                            </td>
                            <td style="width:6.25in; ">
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:references">
                        <tr>
                            <td style="text-align:left; width:auto; " align="left" valign="top">
                                <span>
                                    <b><xsl:text>References:</xsl:text></b>
                                </span>
                            </td>
                            <td style="width:6.25in; ">
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:incidents">
                        <tr>
                            <td style="text-align:left; width:auto; " align="left" valign="top">
                                <span>
                                    <b><xsl:text>Incidents:</xsl:text></b>
                                </span>
                            </td>
                            <td style="width:6.25in; ">
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                </tbody>
            </table>
            <br/>
        </xsl:for-each>
        <br/>
    </xsl:template>
    <xsl:template name="InfoBlock">
        <div class="TemplateDisplayBox">
            <xsl:for-each select="cap:event">
                <h3><xsl:apply-templates/></h3>
            </xsl:for-each>
            <p>
                <xsl:for-each select="cap:description">
                    <xsl:apply-templates/>
                </xsl:for-each>
            </p>
            <table border="0">
                <tbody>
                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Headline:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:headline"/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Category:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:category"/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Urgency:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:urgency"/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Severity:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:severity"/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Certainty:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:certainty"/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Audience:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:audience"/>
                        </td>
                    </tr>

                    <xsl:for-each select="cap:eventCode">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Event Code:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:call-template name="NameValue"/>
                            </td>
                        </tr>
                    </xsl:for-each>

                    <tr>
                        <td>
                            <span>
                                <b><xsl:text>Effective:</xsl:text></b>
                            </span>
                        </td>
                        <td>
                            <xsl:value-of select="cap:effective"/>
                        </td>
                    </tr>

                    <xsl:for-each select="cap:onset">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Onset:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:expires">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Expires:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:senderName">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Sender Name:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:responseType">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Response Type:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:instruction">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Instruction:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:web">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Web:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <a href="#"><xsl:attribute name="onclick">app_openURIInBrowser('<xsl:apply-templates/>')</xsl:attribute><xsl:apply-templates/></a>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <xsl:for-each select="cap:contact">
                        <tr>
                            <td>
                                <span>
                                    <b><xsl:text>Contact:</xsl:text></b>
                                </span>
                            </td>
                            <td>
                                <xsl:apply-templates/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <!-- don't display parameter values for now -->
                    <!--
                        <xsl:for-each select="cap:parameter">
                        <tr>
                            <td>
                                <span>
                                    <xsl:text>Parameter:</xsl:text>
                                </span>
                            </td>
                            <td>
                                <xsl:call-template name="NameValue"/>
                            </td>
                        </tr>
                    </xsl:for-each>
                    -->
                </tbody>
            </table>
        </div>
        <span>
            <h3><xsl:text>Resources:</xsl:text></h3>
        </span>
        <ul>
            <xsl:for-each select="cap:resource">

                <xsl:call-template name="Resource"/>
            </xsl:for-each>
        </ul>
        <span>
            <h3><xsl:text>Areas: </xsl:text></h3>
        </span>
        <ul>
            <xsl:for-each select="cap:area">
                <xsl:call-template name="Area"/>
            </xsl:for-each>
        </ul>
    </xsl:template>
    <xsl:template name="NameValue">
        <div>
            <xsl:for-each select="cap:valueName">
                <xsl:apply-templates/>
            </xsl:for-each>
            <span>
                <xsl:text> = </xsl:text>
            </span>
            <xsl:for-each select="cap:value">
                <xsl:apply-templates/>
            </xsl:for-each>
        </div>
    </xsl:template>
    <xsl:template name="Resource">
        <li>
            <a href="#" onclick="app_openURIInBrowser('{cap:uri}')"><xsl:value-of select="cap:resourceDesc" /></a>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="cap:mimeType"/>
            <xsl:text>) </xsl:text>
        </li>
    </xsl:template>
    <xsl:template name="Area">
        <div>
            <xsl:for-each select="cap:areaDesc">
                <li><xsl:apply-templates/></li>
            </xsl:for-each>
            <!-- removed for now as listing coordinates isn't terribly helfpul.
            <xsl:for-each select="cap:polygon">
                <span>
                    <xsl:text>Polygon: </xsl:text>
                </span>
                <xsl:apply-templates/>
            </xsl:for-each>
            <br/>
            <xsl:for-each select="cap:circle">
                <span>
                    <xsl:text>Circle: </xsl:text>
                </span>
                <xsl:apply-templates/>
            </xsl:for-each>
            <br/>

            <xsl:for-each select="cap:geocode">
                <span>
                    <xsl:text>GeoCode: </xsl:text>
                </span>
                <xsl:call-template name="NameValue"/>
            </xsl:for-each>
            -->
            <xsl:for-each select="cap:altitude">
                <span>
                    <xsl:text>Altitude: </xsl:text>
                </span>
                <xsl:apply-templates/>
            </xsl:for-each>
            <xsl:for-each select="cap:ceiling">
                <span>
                    <xsl:text>Ceiling: </xsl:text>
                </span>
                <xsl:apply-templates/>
            </xsl:for-each>
        </div>
    </xsl:template>

</xsl:stylesheet>