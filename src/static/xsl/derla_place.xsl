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
        <xsl:result-document href="#derla_saxon_container">
            <div class="container bg-light pb-2 pt-2">
                <p><b><xsl:value-of select="//t:titleStmt/t:title"/></b></p>
                <p>Gedachte Personen:</p>
                <ul>
                    <xsl:for-each select="//t:listPerson[@type='victims']/t:person">
                        <li>
                            <a target="_blank" href="{t:persName/@ref}"><xsl:value-of select="t:persName/t:forename"/><xsl:text> </xsl:text> <xsl:value-of select="t:persName/t:surname"/></a>
                        </li>
                    </xsl:for-each>
                </ul>
            </div>
            
        </xsl:result-document>
    </xsl:template>
    
    
    
</xsl:stylesheet>