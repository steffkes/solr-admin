/*
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 (the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// #/cloud
sammy.get
(
    /^#\/(cloud)$/,
    function( context )
    {
        var content_element = $( '#content' );

        $.get
        (
            'tpl/cloud.html',
            function( template )
            {
                content_element
                    .html( template );

                var cloud_element = $( '#cloud', content_element );
                var cloud_content = $( '.content', cloud_element );

                $.ajax
                (
                    {
                        url : app.config.zookeeper_path,
                        dataType : 'json',
                        context : cloud_content,
                        beforeSend : function( xhr, settings )
                        {
                            //this
                            //    .html( '<div class="loader">Loading ...</div>' );
                        },
                        success : function( response, text_status, xhr )
                        {
                            var self = this;
                            
                            $( '#tree', this )
                                .jstree
                                (
                                    {
                                        "plugins" : [ "json_data" ],
                                        "json_data" : {
                                            "data" : response.tree,
                                            "progressive_render" : true
                                        },
                                        "core" : {
                                            "animation" : 0
                                        }
                                    }
                                )
                                .jstree
                                (
                                    'open_node',
                                    'li:first'
                                );

                            var tree_links = $( '#tree a', this );

                            tree_links
                                .die( 'click' )
                                .live
                                (
                                    'click',
                                    function( event )
                                    {
                                        $( 'a.active', $( this ).parents( '#tree' ) )
                                            .removeClass( 'active' );
                                        
                                        $( this )
                                            .addClass( 'active' );

                                        cloud_content
                                            .addClass( 'show' );

                                        var file_content = $( '#file-content' );

                                        $( 'a.close', file_content )
                                            .die( 'click' )
                                            .live
                                            (
                                                'click',
                                                function( event )
                                                {
                                                    $( '#tree a.active' )
                                                        .removeClass( 'active' );
                                            
                                                    cloud_content
                                                        .removeClass( 'show' );

                                                    return false;
                                                }
                                            );

                                        $.ajax
                                        (
                                            {
                                                url : this.href,
                                                dataType : 'json',
                                                context : file_content,
                                                beforeSend : function( xhr, settings )
                                                {
                                                    //this
                                                    //    .html( 'loading' )
                                                    //    .show();
                                                },
                                                success : function( response, text_status, xhr )
                                                {
                                                    //this
                                                    //    .html( '<pre>' + response.znode.data + '</pre>' );

                                                    var props = [];
                                                    for( var key in response.znode.prop )
                                                    {
                                                        props.push
                                                        (
                                                            '<li><dl class="clearfix">' + "\n" +
                                                                '<dt>' + key.esc() + '</dt>' + "\n" +
                                                                '<dd>' + response.znode.prop[key].esc() + '</dd>' + "\n" +
                                                            '</dl></li>'
                                                        );
                                                    }

                                                    $( '#prop ul', this )
                                                        .empty()
                                                        .html( props.join( "\n" ) );

                                                    $( '#prop ul li:odd', this )
                                                        .addClass( 'odd' );

                                                    var data_element = $( '#data', this );

                                                    if( 0 !== parseInt( response.znode.prop.children_count ) )
                                                    {
                                                        data_element.hide();
                                                    }
                                                    else
                                                    {
                                                        var data = response.znode.data
                                                                 ? '<pre>' + response.znode.data.esc() + '</pre>'
                                                                 : '<em>File "' + response.znode.path + '" has no Content</em>';

                                                        data_element
                                                            .show()
                                                            .html( data );
                                                    }
                                                },
                                                error : function( xhr, text_status, error_thrown)
                                                {
                                                },
                                                complete : function( xhr, text_status )
                                                {
                                                }
                                            }
                                        );

                                        return false;
                                    }
                                );
                        },
                        error : function( xhr, text_status, error_thrown )
                        {
                            var message = 'Loading of <code>' + app.config.zookeeper_path + '</code> failed with "' + text_status + '" '
                                        + '(<code>' + error_thrown.message + '</code>)';

                            if( 200 !== xhr.status )
                            {
                                message = 'Loading of <code>' + app.config.zookeeper_path + '</code> failed with HTTP-Status ' + xhr.status + ' ';
                            }

                            this
                                .html( '<div class="block" id="error">' + message + '</div>' );
                        },
                        complete : function( xhr, text_status )
                        {
                        }
                    }
                );
            }
        );
    }
);