<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:t="http://www.tei-c.org/ns/1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math"
    xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:foaf="http://xmlns.com/foaf/0.1/"
    exclude-result-prefixes="xs math"
    version="3.0">
    
    <xsl:template match="/">
        <xsl:result-document href="#saxonjs_container">
            <xsl:choose>
                <xsl:when test="//rdf:type/@rdf:resource = 'http://digitales-memobuch.at/ontology#Event'">
                    <p>Ereignisse assoziiert mit der Person</p>
                    <ol>
                        <xsl:for-each select="//rdf:Description">
                            <xsl:if test="./rdf:type/@rdf:resource = 'http://digitales-memobuch.at/ontology#Event'">
                                <li><b><xsl:value-of select="rdfs:label"/></b></li>    
                            </xsl:if>                                       
                        </xsl:for-each>
                    </ol>
                </xsl:when>
                <xsl:otherwise>
                    <p>Keine Ereignisse mit der Person assoziiert</p>
                </xsl:otherwise>
            </xsl:choose>
            
            <!--<p>Simulating a long running xslt transformation below (rednering a lot of unnecessary DOM elements via SAXONJS):</p>
            <xsl:for-each select="//rdf:type">
                <p><xsl:value-of select="."/></p>
                <xsl:for-each select="//rdf:type">
                    <xsl:for-each select="//rdf:type">
                        <p>hi</p>
                        <xsl:for-each select="//*">
                            <p>pu</p>
                        </xsl:for-each>
                    </xsl:for-each>
                </xsl:for-each>
            </xsl:for-each>-->
            
            
            
        </xsl:result-document>
    </xsl:template>
    
    
    
</xsl:stylesheet>