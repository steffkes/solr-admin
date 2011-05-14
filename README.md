# solr admin

> The idea was to create a new, fresh (and hopefully clean) Solr Admin Interface.
https://issues.apache.org/jira/browse/SOLR-2399

## Installation

    svn co https://svn.apache.org/repos/asf/lucene/dev/trunk/ apache-solr-trunk
    cd apache-solr-trunk/solr/src/webapp/web
    rm -rf admin index.jsp
    git clone git://github.com/steffkes/solr-admin.git
    mv solr-admin/* ./
    rm -rf solr-admin
    cd ../../../
    ant example

If there is no git client on your system, use https://github.com/steffkes/solr-admin/tarball/master

## License

http://www.apache.org/licenses/LICENSE-2.0.html