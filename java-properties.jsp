<%@ page contentType="application/json;charset=UTF-8" language="java" %>

{
<%

java.util.Enumeration e = System.getProperties().propertyNames();
while( e.hasMoreElements() )
{
	String prop = (String)e.nextElement();
	out.println( "\"" + prop + "\" : \"" + System.getProperty( prop ).replace( "\n", "\\\\n" ) + "\"," );
}

%>
"_dummy" : true
}