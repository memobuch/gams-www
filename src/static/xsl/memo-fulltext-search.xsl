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
    
    <xsl:param name="searchQuery"></xsl:param>
    <xsl:param name="currentPage"></xsl:param>
    
    <xsl:template match="/">
        
            <xsl:variable name="pagination" select="/FulltextDigitalObjectResultDto/results/pagination"/>
        
            <!--Result stats-->
            <table class="table w-50">
                <thead>
                    <tr>
                        <th scope="col">Suchwert</th>
                        <th scope="col">Gefundene Elemente</th>
                        <th scope="col">Gesamtanzahl</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><xsl:value-of select="$searchQuery"/></td>
                        <td><xsl:value-of select="$pagination/totalElements"/></td>
                        <td><xsl:value-of select="/FulltextDigitalObjectResultDto/totalUnfilteredCount"/></td>
                    </tr>
                </tbody>
            </table>
        
        
            <p>
                <xsl:value-of select="$currentPage"/>/<xsl:value-of select="$pagination/totalPages"/>
            </p>
            <!-- Pagination -->
            <nav aria-label="Page navigation example">
                <ul class="pagination">
                    <xsl:if test="/FulltextDigitalObjectResultDto/results/pagination/hasPrevious = 'true'">
                        <li class="page-item"><a class="page-link" href="{{context._root_path}}/search-xsl.html?q={$searchQuery}&amp;pageIndex={$currentPage - 1}">Previous</a></li>
                    </xsl:if>
                    
                    <!--<li class="page-item"><a class="page-link" href="#">1</a></li>
                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                    <li class="page-item"><a class="page-link" href="#">3</a></li>-->
                    
                    
                    <xsl:if test="/FulltextDigitalObjectResultDto/results/pagination/hasNext = 'true'">
                        <li class="page-item"><a class="page-link" href="{{context._root_path}}/search-xsl.html?q={$searchQuery}&amp;pageIndex={$currentPage + 1}">Next</a></li>    
                    </xsl:if>
                </ul>
            </nav>
        
            
            <ul class="list-group">
                <xsl:for-each select="//result">
                    <li class="list-group-item"><a target="_blank" href="{{context._root_path}}/objects/{id}"><xsl:value-of select="dc.title"/></a> (<xsl:value-of select="id"/>)</li>
                </xsl:for-each>
            </ul>
    </xsl:template>
    
    <!--Required to get result as string-->
    <xsl:output></xsl:output>
    
    
    
</xsl:stylesheet>