<%@ page contentType="text/html; charset=utf-8" pageEncoding="UTF-8"%>
<% request.setCharacterEncoding("UTF-8"); %>

<%@ page import="java.util.List" %>
<%@ page import="java.util.Collection" %>
<html>
<head>
    
    <title>solr-admin</title>
    
    <link rel="stylesheet" type="text/css" href="css/screen.css">
    <link rel="icon" type="image/ico" href="img/favicon.ico">
    
    <script type="text/javascript">
    
    var app_config = {};
    
    app_config.solr_path = '<%= request.getContextPath() %>';
    
    </script>
    
</head>
<body>
    
    <div id="wrapper">
    
        <div id="header">
            
            <a href="./"><span>Apache SOLR</span></a>

            <p id="environment">&nbsp;</p>

        </div>
        
        <div id="main" class="clearfix">
        
            <div id="content-wrapper">
            <div id="content">
                
                &nbsp;
                
            </div>
            </div>
            
            <div id="menu-wrapper">
            <div id="menu">
                
                <ul>
                    
<%

org.apache.solr.core.CoreContainer cores = (org.apache.solr.core.CoreContainer)request.getAttribute("org.apache.solr.CoreContainer");
if( null != cores )
{
    Collection<String> names = cores.getCoreNames();
    String url = request.getContextPath();
    for( String name : names )
    {
        String core_name = "singlecore";
        String core_path = url;
        
        if( 0 != name.length() )
        {
            core_name = name;
            core_path += "/" + name;
        }
        
        %>
        <li id="<%= core_name %>" data-basepath="<%= core_path %>">
            <p><a href="#/<%= core_name %>"><%= core_name %></a></p>
            
            <ul>
                
                <li class="query"><a rel="#/<%= core_name %>/query"><span>Query</span></a></li>

                <% if( true ) { //(null != core.getSchemaResource()) { %>
                    <li class="schema"><a href="<%= core_path %>/admin/file/?file=schema.xml" rel="#/<%= core_name %>/schema"><span>Schema</span></a></li>
                    <li class="config"><a href="<%= core_path %>/admin/file/?file=solrconfig.xml" rel="#/<%= core_name %>/config"><span>Config</span></a></li>
                <% } %>
                
                <% if( true ) { // !core.getRequestHandlers(ReplicationHandler.class).isEmpty() %>
                    <!--<li class="replication"><a href="<%= core_path %>/admin/replication/index.jsp"><span>Replication</span></a></li>-->
                <% } %>
                
                <li class="analysis"><a href="<%= core_path %>/admin/analysis.jsp?highlight=on" rel="#/<%= core_name %>/analysis"><span>Analysis</span></a></li>
                <!--<li class="schema-browser"><a href="<%= core_path %>/admin/schema.jsp"><span>Schema Browser</span></a></li>-->
                <!--<li class="stats"><a href="<%= core_path %>/admin/stats.jsp"><span>Statistics</span></a></li>-->
                <!--<li class="info"><a href="<%= core_path %>/admin/registry.jsp"><span>Info</span></a></li>-->
                <!--<li class="zookeeper"><a href="<%= core_path %>/admin/zookeeper.jsp"><span>ZooKeeper</span></a></li>-->
                <li class="ping"><a href="<%= core_path %>/admin/ping"><span>Ping</span></a></li>
                <!--<li class="logging"><a href="<%= core_path %>/admin/logging"><span>Logging</span></a></li>-->
                <!--
                <li class="distribution"><a href="<%= core_path %>/admin/distributiondump.jsp"><span>Distribution</span></a></li>
                -->
                <li class="plugins"><a href="<%= core_path %>/admin/plugins" rel="#/<%= core_name %>/plugins"><span>Plugins</span></a></li>
                <!--<li class="java-properties"><a href="<%= core_path %>/admin/get-properties.jsp"><span>Java-Properties</span></a></li>-->
                
            </ul>
            
        </li>
        <%
    }
}

%>
                    
                </ul>
                
            </div>
            </div>
            
            <div id="meta">
                
                <ul>
                    
                    <li class="documentation"><a href="http://lucene.apache.org/solr/"><span>Documentation</span></a></li>
                    <li class="issues"><a href="http://issues.apache.org/jira/browse/SOLR"><span>Issue Tracker</span></a></li>
                    <li class="irc"><a href="http://webchat.freenode.net/?channels=#solr"><span>IRC Channel</span></a></li>
                    <li class="mailinglist"><a href="http://wiki.apache.org/solr/UsingMailingLists"><span>Community forum</span></a></li>
                    <li class="wiki-query-syntax"><a href="http://wiki.apache.org/solr/SolrQuerySyntax"><span>Solr Query Syntax</span></a></li>
                    
                </ul>
                
            </div>
            
        </div>
    
    </div>
    
    <script type="text/javascript" src="js/0_console.js"></script>
    <script type="text/javascript" src="js/1_jquery.js"></script>
    <script type="text/javascript" src="js/jquery.timeago.js"></script>
    <script type="text/javascript" src="js/jquery.form.js"></script>
    <script type="text/javascript" src="js/jquery.sammy.js"></script>
    <script type="text/javascript" src="js/script.js"></script>
    
</body>
</html>