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

// #/
sammy.get
(
    /^#\/$/,
    function( context )
    {
        var content_element = $( '#content' );

        $( '#index', app.menu_element )
            .addClass( 'active' );

        content_element
            .html( '<div id="index"></div>' );

        $.ajax
        (
            {
                url : 'tpl/index.html',
                context : $( '#index', content_element ),
                beforeSend : function( arr, form, options )
                {
                },
                success : function( template )
                {
                    this
                        .html( template );

                    var jvm_memory = $.extend
                    (
                        {
                            'free' : null,
                            'total' : null,
                            'max' : null,
                            'used' : null,
                            'raw' : {
                                'free' : null,
                                'total' : null,
                                'max' : null,
                                'used' : null,
                                'used%' : null
                            }
                        },
                        app.dashboard_values['jvm']['memory']
                    );
    
                    var data = {
                        'start_time' : app.dashboard_values['jvm']['jmx']['startTime'],
                        'host' : app.dashboard_values['core']['host'],
                        'dir_instance' : app.dashboard_values['core']['directory']['instance'],
                        'dir_data' : app.dashboard_values['core']['directory']['data'],
                        'dir_index' : app.dashboard_values['core']['directory']['index'],
                        'jvm_version' : app.dashboard_values['jvm']['name'] + ' (' + app.dashboard_values['jvm']['version'] + ')',
                        'solr_spec_version' : app.dashboard_values['lucene']['solr-spec-version'],
                        'solr_impl_version' : app.dashboard_values['lucene']['solr-impl-version'],
                        'lucene_spec_version' : app.dashboard_values['lucene']['lucene-spec-version'],
                        'lucene_impl_version' : app.dashboard_values['lucene']['lucene-impl-version']
                    };

                    if( app.dashboard_values['core']['directory']['cwd'] )
                    {
                        data['dir_cwd'] = app.dashboard_values['core']['directory']['cwd'];
                    }
    
                    for( var key in data )
                    {                                                        
                        var value_element = $( '.' + key + ' dd', this );

                        value_element
                            .text( data[key].esc() );
                        
                        value_element.closest( 'li' )
                            .show();
                    }

                    var commandLineArgs = app.dashboard_values['jvm']['jmx']['commandLineArgs'];
                    if( 0 !== commandLineArgs.length )
                    {
                        var cmd_arg_element = $( '.command_line_args dt', this );
                        var cmd_arg_key_element = $( '.command_line_args dt', this );
                        var cmd_arg_element = $( '.command_line_args dd', this );

                        for( var key in commandLineArgs )
                        {
                            cmd_arg_element = cmd_arg_element.clone();
                            cmd_arg_element.text( commandLineArgs[key] );

                            cmd_arg_key_element
                                .after( cmd_arg_element );
                        }

                        cmd_arg_key_element.closest( 'li' )
                            .show();

                        $( '.command_line_args dd:last', this )
                            .remove();

                        $( '.command_line_args dd:odd', this )
                            .addClass( 'odd' );
                    }

                    $( '.timeago', this )
                        .timeago();

                    $( '#instance li:visible:odd, #versions li:visible:odd', this )
                        .addClass( 'odd' );
                    
                    // -- common bar

                    var parse_memory_value = function( value )
                    {
                        if( value !== Number( value ) )
                        {
                            var units = 'BKMGTPEZY';
                            var match = value.match( /^(\d+([,\.]\d+)?) (\w)\w?$/ );
                            var value = parseFloat( match[1] ) * Math.pow( 1024, units.indexOf( match[3].toUpperCase() ) );
                        }
                        
                        return value;
                    };

                    var generate_bar = function( bar_holder, bar_data, convert_label_values )
                    {
                        var bar_level = 1;
                        var max_width = Math.round( $( '.bar-max', bar_holder ).width() );
                        $( '.bar-max.val', bar_holder ).text( bar_data['max'] );
                        
                        bar_level++;
                        var total_width = Math.round( ( bar_data['total'] * max_width ) / bar_data['max'] );
                        $( '.bar-total.bar', bar_holder ).width( Math.max( total_width, 1 ) );
                        $( '.bar-total.val', bar_holder ).text( bar_data['total'] );

                        if( bar_data['used'] )
                        {
                            bar_level++;
                            var used_width = Math.round( ( bar_data['used'] * max_width ) / bar_data['max'] );
                            $( '.bar-used.bar', bar_holder ).width( Math.min( used_width, total_width - 1 ) );
                            $( '.bar-used.val', bar_holder ).text( bar_data['used'] );
                        }

                        bar_holder
                            .addClass( 'bar-lvl-' + bar_level );

                        var percentage = ( ( ( bar_data['used'] || bar_data['total'] ) / bar_data['max'] ) * 100 ).toFixed(1);
                            
                        $( '[data-desc="' + bar_holder.attr( 'id' ) + '"]' )
                            .append( ' (' + percentage + '%)' );

                        if( !!convert_label_values )
                        {
                            $( '.val', bar_holder )
                                .each
                                (
                                    function()
                                    {
                                        var self = $( this );

                                        var unit = null;
                                        var byte_value = parseInt( self.html() );

                                        self
                                            .attr( 'title', 'raw: ' + byte_value + ' B' );

                                        byte_value /= 1024;
                                        byte_value /= 1024;
                                        unit = 'MB';

                                        if( 1024 <= byte_value )
                                        {
                                            byte_value /= 1024;
                                            unit = 'GB';
                                        }

                                        byte_value = byte_value.toFixed( 2 ) + ' ' + unit;

                                        self
                                            .text( byte_value );
                                    }
                                );
                        }
                    };

                    // -- physical-memory-bar
                    
                    var bar_holder = $( '#physical-memory-bar', this );
                    var system_data = app.dashboard_values['system'];
                    var bar_data = {
                        'max' : parse_memory_value( system_data['totalPhysicalMemorySize'] ),
                        'total' : parse_memory_value( system_data['totalPhysicalMemorySize'] - system_data['freePhysicalMemorySize'] )
                    };

                    generate_bar( bar_holder, bar_data, true );

                    // -- swap-space-bar
                    
                    var bar_holder = $( '#swap-space-bar', this );
                    var system_data = app.dashboard_values['system'];
                    var bar_data = {
                        'max' : parse_memory_value( system_data['totalSwapSpaceSize'] ),
                        'total' : parse_memory_value( system_data['totalSwapSpaceSize'] - system_data['freeSwapSpaceSize'] )
                    };

                    generate_bar( bar_holder, bar_data, true );

                    // -- swap-space-bar
                    
                    var bar_holder = $( '#file-descriptor-bar', this );
                    var system_data = app.dashboard_values['system'];
                    var bar_data = {
                        'max' : parse_memory_value( system_data['maxFileDescriptorCount'] ),
                        'total' : parse_memory_value( system_data['openFileDescriptorCount'] )
                    };

                    generate_bar( bar_holder, bar_data );

                    // -- memory-bar
                    
                    var bar_holder = $( '#jvm-memory-bar', this );
                    var bar_data = {
                        'max' : parse_memory_value( jvm_memory['raw']['max'] || jvm_memory['max'] ),
                        'total' : parse_memory_value( jvm_memory['raw']['total'] || jvm_memory['total'] ),
                        'used' : parse_memory_value( jvm_memory['raw']['used'] || jvm_memory['used'] )
                    };

                    generate_bar( bar_holder, bar_data, true );
                },
                error : function( xhr, text_status, error_thrown )
                {
                },
                complete : function( xhr, text_status )
                {
                }
            }
        );
    }
);