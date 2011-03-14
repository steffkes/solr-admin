var loader = {
    
    show : function( element )
    {
        $( element )
            .addClass( 'loader' );
    },
    
    hide : function( element )
    {
        $( element )
            .removeClass( 'loader' );
    }
    
};

var sammy = $.sammy
(
    function()
    {
        this.bind
        (
            'run',
            function( event, config )
            {
                if( 0 === config.start_url.length )
                {
                    location.href = '#/';
                    return false;
                }
            }
        );
        
        this.bind
        (
            'ping',
            function( event )
            {
                var element = $( this.params.element );
                
                $.ajax
                (
                    {
                        url : element.attr( 'href' ) + '?wt=json',
                        dataType : 'json',
                        beforeSend : function( arr, form, options )
                        {
                            console.debug( 'before_send', arguments );
                            loader.show( element );
                        },
                        success : function( response )
                        {
                            console.debug( 'success', arguments );
                            
                            var qtime_element = $( '.qtime', element );
                            
                            if( 0 === qtime_element.size() )
                            {
                                qtime_element = $( '<small class="qtime"> (<span></span>)</small>' );
                                
                                element
                                    .append
                                    (
                                        qtime_element
                                    );
                            }
                            
                            $( 'span', qtime_element )
                                .html( response.responseHeader.QTime );
                        },
                        error : function()
                        {
                            console.debug( 'error', arguments );
                        },
                        complete : function()
                        {
                            loader.hide( element );
                        }
                    }
                );
                
                return false;
            }
        );
        
        // activate_core
        this.before
        (
            {},
            function()
            {
                $( 'li[id].active', app.menu_element )
                    .removeClass( 'active' );
                
                $( 'ul li.active', app.menu_element )
                    .removeClass( 'active' );

                if( this.params.splat )
                {
                    this.active_core = $( '#' + this.params.splat[0], app.menu_element );
                    
                    this.active_core
                        .addClass( 'active' );

                    if( this.params.splat[1] )
                    {
                        $( '.' + this.params.splat[1], this.active_core )
                            .addClass( 'active' );
                    }
                }
                else
                {
                    $( '#index', app.menu_element )
                        .addClass( 'active' );
                }
            }
        );

        // #/:core/info(/stats)
        this.get
        (
            /^#\/([\w\d]+)\/info/,
            function( context )
            {
                var core_basepath = this.active_core.attr( 'data-basepath' );
                var content_element = $( '#content' );
                var show_stats = 0 <= this.path.indexOf( 'stats' );
                
                if( show_stats )
                {
                    $( 'li.stats', this.active_core )
                        .addClass( 'active' );
                }
                else
                {
                    $( 'li.plugins', this.active_core )
                        .addClass( 'active' );
                }
                
                content_element
                    .html( '<div id="plugins"></div>' );
                
                $.ajax
                (
                    {
                        url : core_basepath + '/admin/mbeans?stats=true&wt=json',
                        dataType : 'json',
                        context : $( '#plugins', content_element ),
                        beforeSend : function( xhr, settings )
                        {
                            this
                                .html( '<div class="loader">Loading ...</div>' );
                        },
                        success : function( response, text_status, xhr )
                        {
                            var sort_table = {};
                            var content = '';
                            
                            response.plugins = {};
                            var plugin_key = null;

                            for( var i = 0; i < response['solr-mbeans'].length; i++ )
                            {
                                if( !( i % 2 ) )
                                {
                                    plugin_key = response['solr-mbeans'][i];
                                }
                                else
                                {
                                    response.plugins[plugin_key] = response['solr-mbeans'][i];
                                }
                            }

                            for( var key in response.plugins )
                            {
                                sort_table[key] = {
                                    url : [],
                                    component : [],
                                    handler : []
                                };
                                for( var part_key in response.plugins[key] )
                                {
                                    if( 0 < part_key.indexOf( '.' ) )
                                    {
                                        sort_table[key]['handler'].push( part_key );
                                    }
                                    else if( 0 === part_key.indexOf( '/' ) )
                                    {
                                        sort_table[key]['url'].push( part_key );
                                    }
                                    else
                                    {
                                        sort_table[key]['component'].push( part_key );
                                    }
                                }
                                
                                content += '<div class="block" id="' + key.toLowerCase() + '">' + "\n";
                                content += '<h2><span>' + key + '</span></h2>' + "\n";
                                content += '<div class="content">' + "\n";
                                content += '<ul>' + "\n";
                                
                                for( var sort_key in sort_table[key] )
                                {
                                    sort_table[key][sort_key].sort();
                                    var sort_key_length = sort_table[key][sort_key].length;
                                    
                                    for( var i = 0; i < sort_key_length; i++ )
                                    {
                                        content += '<li><a>' + sort_table[key][sort_key][i] + '</a>' + "\n";
                                        content += '<dl class="clearfix">' + "\n";
                                        
                                        var details = response.plugins[key][ sort_table[key][sort_key][i] ];
                                        for( var detail_key in details )
                                        {
                                            if( 'stats' !== detail_key )
                                            {
                                                content += '<dt>' + detail_key + ':</dt>' + "\n";
                                                content += '<dd>' + details[detail_key] + '</dd>' + "\n";
                                            }
                                            else if( 'stats' === detail_key && details[detail_key] && show_stats )
                                            {
                                                content += '<dt>' + detail_key + ':</dt>' + "\n";
                                                content += '<dd>' + "\n";

                                                content += '<dl class="clearfix">' + "\n";
                                                    for( var stats_key in details[detail_key] )
                                                    {
                                                        content += '<dt>' + stats_key + ':</dt>' + "\n";
                                                        content += '<dd>' + details[detail_key][stats_key] + '</dd>' + "\n";
                                                    }
                                                content += '</dl>' + "\n";

                                                content += '</dd>' + "\n";
                                            }
                                        }
                                        
                                        content += '</dl>' + "\n";
                                    }
                                }
                                
                                content += '</ul>' + "\n";
                                content += '</div>' + "\n";
                                content += '</div>' + "\n";
                            }
                            
                            this
                                .html( content );
                            
                            $( '.block a', this )
                                .live
                                (
                                    'click',
                                    function( event )
                                    {
                                        $( this ).parent()
                                            .toggleClass( 'expanded' );
                                    }
                                );
                        },
                        error : function( xhr, text_status, error_thrown)
                        {
                        },
                        complete : function( xhr, text_status )
                        {
                        }
                    }
                );
                
            }
        );

        // #/:core/query
        this.get
        (
            /^#\/([\w\d]+)\/query$/,
            function( context )
            {
                var core_basepath = this.active_core.attr( 'data-basepath' );
                var content_element = $( '#content' );
                
                $( 'li.query', this.active_core )
                    .addClass( 'active' );
                
                $.get
                (
                    'tpl/query.html',
                    function( template )
                    {
                        content_element
                            .html( template );

                        var query_element = $( '#query', content_element );
                        var query_form = $( '#form form', query_element );
                        var url_element = $( '#url input', query_element );
                        var result_element = $( '#result', query_element );
                        var response_element = $( '#response iframe', result_element );

                        url_element
                            .die( 'change' )
                            .live
                            (
                                'change',
                                function( event )
                                {
                                    var check_iframe_ready_state = function()
                                    {
                                        var iframe_element = response_element.get(0).contentWindow.document || 
                                                             response_element.get(0).document;

                                        if( !iframe_element )
                                        {
                                            console.debug( 'no iframe_element found', response_element );
                                            return false;
                                        }

                                        url_element
                                            .addClass( 'loader' );

                                        if( 'complete' === iframe_element.readyState )
                                        {
                                            url_element
                                                .removeClass( 'loader' );
                                        }
                                        else
                                        {
                                            window.setTimeout( check_iframe_ready_state, 100 );
                                        }
                                    }
                                    check_iframe_ready_state();

                                    response_element
                                        .attr( 'src', this.value )
                                    
                                    if( !response_element.hasClass( 'resized' ) )
                                    {
                                        response_element
                                            .addClass( 'resized' )
                                            .css( 'height', $( '#main' ).height() - 60 );
                                    }
                                }
                            )

                        $( '.optional legend input[type=checkbox]', query_form )
                            .die( 'change' )
                            .live
                            (
                                'change',
                                function( event )
                                {
                                    var fieldset = $( this ).parents( 'fieldset' );

                                    this.checked
                                        ? fieldset.addClass( 'expanded' )
                                        : fieldset.removeClass( 'expanded' );
                                }
                            )

                        query_form
                            .die( 'submit' )
                            .live
                            (
                                'submit',
                                function( event )
                                {
                                    var query_url = window.location.protocol + '//' +
                                                    window.location.host +
                                                    core_basepath +
                                                    '/select?' +
                                                    query_form.formSerialize();
                                    
                                    url_element
                                        .val( query_url )
                                        .trigger( 'change' );
                                    
                                    result_element
                                        .show();
                                    
                                    return false;
                                }
                            );
                    }
                );
            }
        );
        
        // #/:core/analysis
        this.get
        (
            /^#\/([\w\d]+)\/analysis$/,
            function( context )
            {
                var core_basepath = this.active_core.attr( 'data-basepath' );
                var content_element = $( '#content' );
                
                $( 'li.analysis', this.active_core )
                    .addClass( 'active' );
                
                $.get
                (
                    'tpl/analysis.html',
                    function( template )
                    {
                        content_element
                            .html( template );
                        
                        var analysis_element = $( '#analysis', content_element );
                        var analysis_form = $( 'form', analysis_element );
                        
                        $.ajax
                        (
                            {
                                url : core_basepath + '/admin/luke?wt=json&show=schema',
                                dataType : 'json',
                                context : $( '#type_or_name', analysis_form ),
                                beforeSend : function( xhr, settings )
                                {
                                    this
                                        .html( '<option value="">Loading ... </option>' )
                                        .addClass( 'loader' );
                                },
                                success : function( response, text_status, xhr )
                                {
                                    var content = '';
                                    
                                    var fields = [];
                                    for( var field_name in response.schema.fields )
                                    {
                                        fields.push
                                        (
                                            '<option value="fieldname=' + field_name + '">' + field_name + '</option>'
                                        );
                                    }
                                    if( 0 !== fields.length )
                                    {
                                        content += '<optgroup label="Fields">' + "\n";
                                        content += fields.join( "\n" ) + "\n";
                                        content += '</optgroup>' + "\n";
                                    }
                                    
                                    var types = [];
                                    for( var type_name in response.schema.types )
                                    {
                                        types.push
                                        (
                                            '<option value="fieldtype=' + type_name + '">' + type_name + '</option>'
                                        );
                                    }
                                    if( 0 !== types.length )
                                    {
                                        content += '<optgroup label="Types">' + "\n";
                                        content += types.join( "\n" ) + "\n";
                                        content += '</optgroup>' + "\n";
                                    }
                                    
                                    var dynamic_fields = [];
                                    for( var type_name in response.schema.dynamicFields )
                                    {
                                        dynamic_fields.push
                                        (
                                            '<option value="fieldtype=' + type_name + '">' + type_name + '</option>'
                                        );
                                    }
                                    if( 0 !== dynamic_fields.length )
                                    {
                                        content += '<optgroup label="DynamicFields">' + "\n";
                                        content += dynamic_fields.join( "\n" ) + "\n";
                                        content += '</optgroup>' + "\n";
                                    }
                                    
                                    this
                                        .html( content );
                                    
                                    $( 'option[value=fieldname\=' + response.schema.defaultSearchField + ']', this )
                                        .attr( 'selected', 'selected' );
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                },
                                complete : function( xhr, text_status )
                                {
                                    this
                                        .removeClass( 'loader' );
                                }
                            }
                        );
                        
                        var analysis_result = $( '.analysis-result', analysis_element );
                        analysis_result_tpl = analysis_result.clone();
                        analysis_result.remove();
                        
                        var verbose_output = false;
                        
                        analysis_form
                            .ajaxForm
                            (
                                {
                                    url : core_basepath + '/analysis/field?wt=json',
                                    dataType : 'json',
                                    beforeSubmit : function( array, form, options )
                                    {
                                        //loader
                                        
                                        $( '.analysis-result', analysis_element )
                                            .remove();
                                        
                                        verbose_output = $( '#verbose_output', form ).is( ':checked' );
                                        
                                        array.push( { name: 'analysis.showmatch', value: 'true' } );
                                        
                                        var type_or_name = $( '#type_or_name', form ).val().split( '=' );
                                        
                                        array.push( { name: 'analysis.' + type_or_name[0], value: type_or_name[1] } );
                                    },
                                    success : function( response, status_text, xhr, form )
                                    {
                                        for( var name in response.analysis.field_names )
                                        {
                                            build_analysis_table( 'name', name, response.analysis.field_names[name], verbose_output );
                                        }
                                        
                                        for( var name in response.analysis.field_types )
                                        {
                                            build_analysis_table( 'type', name, response.analysis.field_types[name], verbose_output );
                                        }
                                    },
                                    complete : function()
                                    {
                                        //loader
                                    }
                                }
                            );
                            
                            var build_analysis_table = function( field_or_name, name, analysis_data, verbose )
                            {
                                verbose = !!verbose;
                                
                                var analysis_result_data = analysis_result_tpl.clone();
                                var content = [];
                                
                                for( var type in analysis_data )
                                {
                                    var type_length = analysis_data[type].length;
                                    if( 0 !== type_length )
                                    {
                                        var type_content = '<div class="' + type + '">' + "\n";
                                        type_content += '<table border="1">' + "\n";
                                        for( var i = 0; i < type_length; i += 2 )
                                        {
                                            type_content += '<tr>' + "\n";
                                            
                                            var analyzer_parts = analysis_data[type][i].split( '.' );
                                            var analyzer_parts_name = analyzer_parts.pop();
                                            var analyzer_parts_namespace = analyzer_parts.join( '.' ) + '.';
                                            
                                            var analyzer_parts_formatted_name = '';
                                            
                                            if( verbose )
                                            {
                                                analyzer_parts_formatted_name += '<span>' + analyzer_parts_namespace + '</span>';
                                            }
                                            analyzer_parts_formatted_name += analyzer_parts_name;
                                            
                                            type_content += '<th colspan="' + analysis_data[type][i+1].length + '" ' +
                                                            '    title="' + analysis_data[type][i] +'">' + 
                                                            analyzer_parts_formatted_name + '</th>' + "\n";
                                            
                                            type_content += '</tr>' + "\n";
                                            type_content += '<tr>' + "\n";
                                            
                                            var parts = {
                                                'position' : [],
                                                'text' : [],
                                                'type' : [],
                                                'start-end' : []
                                            };
                                            for( var k in analysis_data[type][i+1] )
                                            {
                                                var is_match = !!analysis_data[type][i+1][k]['match'];
                                            
                                                parts['position'].push( '<td>' + analysis_data[type][i+1][k]['position'] + '</td>' );
                                                parts['text'].push( '<td>' + analysis_data[type][i+1][k]['text'] + '</td>' );
                                                parts['type'].push( '<td>' + analysis_data[type][i+1][k]['type'] + '</td>' );
                                                parts['start-end'].push( '<td>' + analysis_data[type][i+1][k]['start'] + '–' + analysis_data[type][i+1][k]['end'] + '</td>' );
                                            }
                                            type_content += '<td><table border="1">' + "\n";
                                            
                                            if( verbose )
                                            {
                                                type_content += '<tr>' + "\n";
                                                type_content += '<th>Position</th>' + "\n";
                                                type_content += parts['position'].join( "\n" ) + "\n";
                                                type_content += '</tr>' + "\n";
                                            }
                                            
                                            if( 0 !== parts['text'].length )
                                            {
                                                type_content += '<tr>' + "\n";
                                                type_content += '<th>Text</th>' + "\n";
                                                type_content += parts['text'].join( "\n" ) + "\n";
                                                type_content += '</tr>' + "\n";
                                            }
                                            
                                            if( verbose )
                                            {
                                                type_content += '<tr>' + "\n";
                                                type_content += '<th>Type</th>' + "\n";
                                                type_content += parts['type'].join( "\n" ) + "\n";
                                                type_content += '</tr>' + "\n";
                                                type_content += '<tr>' + "\n";
                                                type_content += '<th>Start, End</th>' + "\n";
                                                type_content += parts['start-end'].join( "\n" ) + "\n";
                                                type_content += '</tr>' + "\n";
                                            }
                                            
                                            type_content += '</table></td>' + "\n";
                                            
                                            type_content += '</tr>' + "\n";
                                        }
                                        type_content += '</table>' + "\n";
                                        type_content += '</div>';
                                        content.push( $.trim( type_content ) );
                                    }
                                }
                                
                                $( 'h2 span', analysis_result_data )
                                    .html( field_or_name + ' : ' + name );
                                
                                $( '.analysis-result-content', analysis_result_data )
                                    .html( content.join( "\n" ) );
                                
                                analysis_element.append( analysis_result_data );
                                
                            }
                            
                    }
                );
            }
        );
        
        // #/:core/schema, #/:core/config
        this.get
        (
            /^#\/([\w\d]+)\/(schema|config)$/,
            function( context )
            {
                var content_element = $( '#content' );

                content_element
                    //.addClass( 'single' )
                    .html( '<iframe src="' + $( 'a', menu_item ).attr( 'href' ) + '"></iframe>' );
                
                $( 'iframe', content_element )
                    .css( 'height', $( '#main' ).height() );
            }
        );
        
        // #/:core
        this.get
        (
            /^#\/([\w\d]+)$/,
            function( context )
            {
                var core_basepath = this.active_core.attr( 'data-basepath' );
                var content_element = $( '#content' );
                
                content_element
                    .removeClass( 'single' );
                
                var core_menu = $( 'ul', this.active_core );
                if( !core_menu.data( 'admin-extra-loaded' ) )
                {
                    core_menu.data( 'admin-extra-loaded', new Date() );

                    $.get
                    (
                        core_basepath + '/admin/file/?file=admin-extra.menu-top.html',
                        function( menu_extra )
                        {
                            core_menu
                                .prepend( menu_extra );
                        }
                    );
                    
                    $.get
                    (
                        core_basepath + '/admin/file/?file=admin-extra.menu-bottom.html',
                        function( menu_extra )
                        {
                            core_menu
                                .append( menu_extra );
                        }
                    );
                }
                
                $.get
                (
                    'tpl/dashboard.html',
                    function( template )
                    {
                        content_element
                            .html( template );
                            
                        var dashboard_element = $( '#dashboard' );
                        
                        /*
                        $.ajax
                        (
                            {
                                url : core_basepath + '/admin/system?wt=json',
                                dataType : 'json',
                                context : $( '#system', dashboard_element ),
                                beforeSend : function( xhr, settings )
                                {
                                    $( 'h2', this )
                                        .addClass( 'loader' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Loading' );
                                },
                                success : function( response, text_status, xhr )
                                {
                                    $( '.message', this )
                                        .empty()
                                        .hide();
                                    
                                    $( 'dl', this )
                                        .show();
                                        
                                    var data = {
                                        'core_now' : response['core']['now'],
                                        'core_start' : response['core']['start'],
                                        'core_host' : response['core']['host'],
                                        'core_schema' : response['core']['schema'],
                                        'lucene_solr-spec-version' : response['lucene']['solr-spec-version'],
                                        'lucene_solr-impl-version' : response['lucene']['solr-impl-version'],
                                        'lucene_lucene-spec-version' : response['lucene']['lucene-spec-version'],
                                        'lucene_lucene-impl-version' : response['lucene']['lucene-impl-version']
                                    };
                                    
                                    for( var key in data )
                                    {
                                        $( '.' + key, this )
                                            .show();
                                        
                                        $( '.value.' + key, this )
                                            .html( data[key] );
                                    }
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                    this
                                        .addClass( 'disabled' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'System-Handler is not configured' );
                                },
                                complete : function( xhr, text_status )
                                {
                                    $( 'h2', this )
                                        .removeClass( 'loader' );
                                }
                            }
                        );
                        //*/
                        
                        $.ajax
                        (
                            {
                                url : core_basepath + '/admin/luke?wt=json',
                                dataType : 'json',
                                context : $( '#statistics', dashboard_element ),
                                beforeSend : function( xhr, settings )
                                {
                                    $( 'h2', this )
                                        .addClass( 'loader' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Loading ...' );
                                    
                                    $( '.content' )
                                        .hide();
                                },
                                success : function( response, text_status, xhr )
                                {
                                    $( '.message', this )
                                        .empty()
                                        .hide();
                                    
                                    $( '.content', this )
                                        .show();
                                        
                                    var data = {
                                        'index_num-docs' : response['index']['numDocs'],
                                        'index_max-doc' : response['index']['maxDoc'],
                                        'index_last-modified' : response['index']['lastModified']
                                    };
                                    
                                    for( var key in data )
                                    {
                                        $( '.' + key, this )
                                            .show();
                                        
                                        $( '.value.' + key, this )
                                            .html( data[key] );
                                    }

                                    var optimized_element = $( '.value.index_optimized', this );
                                    if( response['index']['optimized'] )
                                    {
                                        optimized_element
                                            .addClass( 'ico-1' );

                                        $( 'span', optimized_element )
                                            .html( 'yes' );
                                    }
                                    else
                                    {
                                        optimized_element
                                            .addClass( 'ico-0' );

                                        $( 'span', optimized_element )
                                            .html( 'no' );
                                    }

                                    var current_element = $( '.value.index_current', this );
                                    if( response['index']['current'] )
                                    {
                                        current_element
                                            .addClass( 'ico-1' );

                                        $( 'span', current_element )
                                            .html( 'yes' );
                                    }
                                    else
                                    {
                                        current_element
                                            .addClass( 'ico-0' );

                                        $( 'span', current_element )
                                            .html( 'no' );
                                    }

                                    var deletions_element = $( '.value.index_has-deletions', this );
                                    if( response['index']['hasDeletions'] )
                                    {
                                        deletions_element.prev()
                                            .show();
                                        
                                        deletions_element
                                            .show()
                                            .addClass( 'ico-0' );

                                        $( 'span', deletions_element )
                                            .html( 'yes' );
                                    }

                                    $( 'a', optimized_element )
                                        .die( 'click' )
                                        .live
                                        (
                                            'click',
                                            function( event )
                                            {                        
                                                $.ajax
                                                (
                                                    {
                                                        url : core_basepath + '/update?optimize=true&waitFlush=true&wt=json',
                                                        dataType : 'json',
                                                        context : $( this ),
                                                        beforeSend : function( xhr, settings )
                                                        {
                                                            this
                                                                .addClass( 'loader' );
                                                        },
                                                        success : function( response, text_status, xhr )
                                                        {
                                                            this.parents( 'dd' )
                                                                .removeClass( 'ico-0' )
                                                                .addClass( 'ico-1' );
                                                        },
                                                        error : function( xhr, text_status, error_thrown)
                                                        {
                                                            console.warn( 'd0h, optimize broken!' );
                                                        },
                                                        complete : function( xhr, text_status )
                                                        {
                                                            this
                                                                .removeClass( 'loader' );
                                                        }
                                                    }
                                                );
                                            }
                                        );

                                    $( '.timeago', this )
                                         .timeago();
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                    this
                                        .addClass( 'disabled' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Luke is not configured' );
                                },
                                complete : function( xhr, text_status )
                                {
                                    $( 'h2', this )
                                        .removeClass( 'loader' );
                                }
                            }
                        );
                        
                        $.ajax
                        (
                            {
                                url : core_basepath + '/replication?command=details&wt=json',
                                dataType : 'json',
                                context : $( '#replication', dashboard_element ),
                                beforeSend : function( xhr, settings )
                                {
                                    $( 'h2', this )
                                        .addClass( 'loader' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Loading' );

                                    $( '.content', this )
                                        .hide();
                                },
                                success : function( response, text_status, xhr )
                                {
                                    $( '.message', this )
                                        .empty()
                                        .hide();

                                    $( '.content', this )
                                        .show();
                                    
                                    $( '.replication', context.active_core )
                                        .show();
                                    
                                    var is_master = 'undefined' === typeof( response['details']['slave'] );
                                    var headline = $( 'h2 span', this );

                                    if( is_master )
                                    {
                                        this
                                            .addClass( 'is-master' );
                                        
                                        headline
                                            .html( headline.html() + ' (Master)' );
                                    }
                                    else
                                    {
                                        this
                                            .addClass( 'is-slave' );
                                        
                                        headline
                                            .html( headline.html() + ' (Slave)' );
                                    }
                                    
                                    var data = {
                                        'details_index-version' : response['details']['indexVersion'],
                                        'details_generation' : response['details']['generation'],
                                        'details_index-size' : response['details']['indexSize']
                                    };
                                    
                                    if( !is_master )
                                    {
                                        $.extend
                                        (
                                            data,
                                            {
                                                'details_slave_master-details_index-version' : response['details']['slave']['masterDetails']['indexVersion'],
                                                'details_slave_master-details_generation' : response['details']['slave']['masterDetails']['generation'],
                                                'details_slave_master-details_index-size' : response['details']['slave']['masterDetails']['indexSize'],
                                                'details_slave_master-url' : response['details']['slave']['masterUrl'],
                                                'details_slave_poll-interval' : response['details']['slave']['pollInterval'],
                                                'details_slave_next-execution-at' : response['details']['slave']['nextExecutionAt'],
                                                'details_slave_index-replicated-at' : response['details']['slave']['indexReplicatedAt'],
                                                'details_slave_last-cycle-bytes-downloaded' : response['details']['slave']['lastCycleBytesDownloaded'],
                                                'details_slave_replication-failed-at' : response['details']['slave']['replicationFailedAt'],
                                                'details_slave_previous-cycle-time-in-seconds' : response['details']['slave']['previousCycleTimeInSeconds'],
                                                'details_slave_is-polling-disabled' : response['details']['slave']['isPollingDisabled'],
                                                'details_slave_is-replicating' : response['details']['slave']['isReplicating']
                                            }
                                        );
                                    
                                        $( 'dl', this )
                                            .show();
                                    }
                                    
                                    for( var key in data )
                                    {
                                        $( '.' + key, this )
                                            .show();
                                        
                                        $( '.value.' + key, this )
                                            .html( data[key] );
                                    }

                                    // $( '.timeago', this )
                                    //     .timeago();
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                    this
                                        .addClass( 'disabled' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Replication is not configured' );
                                },
                                complete : function( xhr, text_status )
                                {
                                    $( 'h2', this )
                                        .removeClass( 'loader' );
                                }
                            }
                        );

                        /*
                        $.ajax
                        (
                            {
                                url : core_basepath + '/dataimport?command=details&wt=json',
                                dataType : 'json',
                                context : $( '#dataimport', dashboard_element ),
                                beforeSend : function( xhr, settings )
                                {
                                    $( 'h2', this )
                                        .addClass( 'loader' );

                                    $( '.message', this )
                                        .show()
                                        .html( 'Loading' );
                                },
                                success : function( response, text_status, xhr )
                                {
                                    $( '.message', this )
                                        .empty()
                                        .hide();
                                    
                                    $( 'dl', this )
                                        .show();
                                    
                                    var data = {
                                        'status' : response['status'],
                                        'info' : response['statusMessages']['']
                                    };
                                    
                                    for( var key in data )
                                    {
                                        $( '.' + key, this )
                                            .show();
                                        
                                        $( '.value.' + key, this )
                                            .html( data[key] );
                                    }
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                    this
                                        .addClass( 'disabled' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'DataImport is not configured' );
                                },
                                complete : function( xhr, text_status )
                                {
                                    $( 'h2', this )
                                        .removeClass( 'loader' );
                                }
                            }
                        );
                        //*/
                        
                        $.ajax
                        (
                            {
                                url : core_basepath + '/admin/file/?file=admin-extra.html',
                                dataType : 'html',
                                context : $( '#admin-extra', dashboard_element ),
                                beforeSend : function( xhr, settings )
                                {
                                    $( 'h2', this )
                                        .addClass( 'loader' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'Loading' );

                                    $( '.content', this )
                                        .hide();
                                },
                                success : function( response, text_status, xhr )
                                {
                                    $( '.message', this )
                                        .hide()
                                        .empty();

                                    $( '.content', this )
                                        .show()
                                        .html( response );
                                },
                                error : function( xhr, text_status, error_thrown)
                                {
                                    this
                                        .addClass( 'disabled' );
                                    
                                    $( '.message', this )
                                        .show()
                                        .html( 'We found no "admin-extra.html" file.' );
                                },
                                complete : function( xhr, text_status )
                                {
                                    $( 'h2', this )
                                        .removeClass( 'loader' );
                                }
                            }
                        );
                        
                    }
                );
            }
        );
        
        // #/
        this.get
        (
            /^#\/$/,
            function( context )
            {
                var content_element = $( '#content' );

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
            
                            var data = {
                                'start_time' : app.dashboard_values['jvm']['jmx']['startTime'],
                                'host' : app.dashboard_values['core']['host'],
                                'cwd' : app.dashboard_values['core']['directory']['cwd'],
                                'jvm' : app.dashboard_values['jvm']['name'] + ' (' + app.dashboard_values['jvm']['version'] + ')',
                                'solr_spec_version' : app.dashboard_values['lucene']['solr-spec-version'],
                                'solr_impl_version' : app.dashboard_values['lucene']['solr-impl-version'],
                                'lucene_spec_version' : app.dashboard_values['lucene']['lucene-spec-version'],
                                'lucene_impl_version' : app.dashboard_values['lucene']['lucene-impl-version'],
                                'memory-bar-max' : parseInt( app.dashboard_values['jvm']['memory']['raw']['max'] ),
                                'memory-bar-total' : parseInt( app.dashboard_values['jvm']['memory']['raw']['total'] ),
                                'memory-bar-used' : parseInt( app.dashboard_values['jvm']['memory']['raw']['used'] )
                            };
            
                            for( var key in data )
                            {                                                        
                                $( '.value.' + key, this )
                                    .html( data[key] );
                            }

                            var cmd_arg_key_element = $( 'dt.command_line_args', this );
                            var cmd_arg_element = $( '.value.command_line_args', this );

                            for( var key in app.dashboard_values['jvm']['jmx']['commandLineArgs'] )
                            {
                                cmd_arg_element = cmd_arg_element.clone();
                                cmd_arg_element.html( app.dashboard_values['jvm']['jmx']['commandLineArgs'][key] );

                                cmd_arg_key_element
                                    .after( cmd_arg_element );
                            }

                            $( '.value.command_line_args:last', this )
                                .remove();

                            $( '.timeago', this )
                                .timeago();

                            $( 'dt:odd', this )
                                .addClass( 'odd' );
                            
                            // -- memory bar

                            var max_height = Math.round( $( '#memory-bar-max', this ).height() );
                            var total_height = Math.round( ( data['memory-bar-total'] * max_height ) / data['memory-bar-max'] );
                            var used_height = Math.round( ( data['memory-bar-used'] * max_height ) / data['memory-bar-max'] );

                            var memory_bar_total_value = $( '#memory-bar-total span', this ).first();

                            $( '#memory-bar-total', this )
                                .height( total_height );
                            
                            $( '#memory-bar-used', this )
                                .height( used_height );

                            if( used_height < total_height + memory_bar_total_value.height() )
                            {
                                memory_bar_total_value
                                    .addClass( 'upper' )
                                    .css( 'margin-top', memory_bar_total_value.height() * -1 );
                            }

                            var memory_percentage = ( ( data['memory-bar-used'] / data['memory-bar-max'] ) * 100 ).toFixed(1);
                            var headline = $( '#memory h2 span', this );
                                
                            headline
                                .html( headline.html() + ' (' + memory_percentage + '%)' );

                            $( '#memory-bar .value', this )
                                .each
                                (
                                    function()
                                    {
                                        var self = $( this );

                                        var byte_value = parseInt( self.html() );

                                        self
                                            .attr( 'title', 'raw: ' + byte_value + ' B' );

                                        byte_value /= 1024;
                                        byte_value /= 1024;
                                        byte_value = byte_value.toFixed( 2 ) + ' MB';

                                        self
                                            .html( byte_value );
                                    }
                                );
                            
                            // -- zookeeper tree

                            var zookeeper_element = $( '#zookeeper', this );

                            var has_zookeeper = false;
                            zookeeper_element.hide();

                            for( var key in app.dashboard_values['jvm']['jmx']['commandLineArgs'] )
                            {
                                if( 0 === app.dashboard_values['jvm']['jmx']['commandLineArgs'][key].indexOf( '-Dzk' ) )
                                {
                                    has_zookeeper = true;
                                    break;
                                }
                            }

                            if( has_zookeeper )
                            {
                                zookeeper_element
                                    .show();

                                $.ajax
                                (
                                    {
                                        url : app.config.zookeeper_path,
                                        dataType : 'json',
                                        context : $( '.content', zookeeper_element ),
                                        beforeSend : function( xhr, settings )
                                        {
                                            this
                                                .html( '<div class="loader">Loading ...</div>' );
                                        },
                                        success : function( response, text_status, xhr )
                                        {
                                            this
                                                .html( '<div id="zookeeper-tree" class="tree"></div>' );
                                            
                                            $( '#zookeeper-tree', this )
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
                                                );
                                        },
                                        error : function( xhr, text_status, error_thrown)
                                        {
                                        },
                                        complete : function( xhr, text_status )
                                        {
                                        }
                                    }
                                );
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
            }
        );
    }
);

var solr_admin = function()
{
    menu_element = null,

    is_multicore = null,
    active_core = null,
    environment_basepath = null,

    config = null,
    params = null,
    dashboard_values = null,
    
    this.init_menu = function()
    {
        $( '.ping a', this.menu_element )
            .live
            (
                'click',
                function()
                {
                    sammy.trigger
                    (
                        'ping',
                        { element : this }
                    );
                    return false;
                }
            );
        
        $( 'a[rel]', this.menu_element )
            .live
            (
                'click',
                function()
                {
                    location.href = this.rel;
                    return false;
                }
            );
    }
    
    this.__construct = function()
    {
        this.menu_element = $( '#menu ul' );
        
        this.init_menu();
    }
    this.__construct();
}

var app;
$( document ).ready
(
    function()
    {
        jQuery.timeago.settings.allowFuture = true;
        
        app = new solr_admin();
        app.config = app_config;

        $.ajax
        (
            {
                url : app.config.solr_path + app.config.core_admin_path + '?wt=json',
                dataType : 'json',
                beforeSend : function( arr, form, options )
                {               
                    $( '#content' )
                        .html( '<div id="index"><div class="loader">Loading ...</div></div>' );
                },
                success : function( response )
                {
                    app.is_multicore = 'undefined' === typeof response.status[''];

                    for( var core_name in response.status )
                    {
                        var core_path = app.config.solr_path + '/' + core_name;

                        if( !core_name )
                        {
                            core_name = 'singlecore';
                            core_path = app.config.solr_path
                        }

                        if( !app.environment_basepath )
                        {
                            app.environment_basepath = core_path;
                        }

                        var core_tpl = '<li id="' + core_name + '" data-basepath="' + core_path + '">' + "\n"
                                     + '    <p><a href="#/' + core_name + '">' + core_name + '</a></p>' + "\n"
                                     + '    <ul>' + "\n"

                                     + '        <li class="query"><a rel="#/' + core_name + '/query"><span>Query</span></a></li>' + "\n"
                                     + '        <li class="schema"><a href="' + core_path + '/admin/file/?file=schema.xml" rel="#/' + core_name + '/schema"><span>Schema</span></a></li>' + "\n"
                                     + '        <li class="config"><a href="' +core_path + '/admin/file/?file=solrconfig.xml" rel="#/' + core_name + '/config"><span>Config</span></a></li>' + "\n"
                                     + '        <li class="replication optional"><a href="' + core_path + '/admin/replication/index.jsp"><span>Replication</span></a></li>' + "\n"
                                     + '        <li class="analysis"><a href="' + core_path + '/admin/analysis.jsp?highlight=on" rel="#/' + core_name + '/analysis"><span>Analysis</span></a></li>' + "\n"
                                     + '        <li class="schema-browser"><a href="' + core_path + '/admin/schema.jsp"><span>Schema Browser</span></a></li>' + "\n"
                                     + '        <li class="stats"><a href="' +core_path + '/admin/stats.jsp" rel="#/' + core_name + '/info/stats"><span>Statistics</span></a></li>' + "\n"
                                     + '        <li class="ping"><a href="' + core_path + '/admin/ping"><span>Ping</span></a></li>' + "\n"
                                     + '        <li class="logging"><a href="' + core_path + '/admin/logging"><span>Logging</span></a></li>' + "\n"
                                     + '        <li class="plugins"><a href="' + core_path + '/admin/plugins" rel="#/' + core_name + '/info"><span>Plugins</span></a></li>' + "\n"
                                     + '        <li class="java-properties"><a href="' + core_path + '/admin/get-properties.jsp"><span>Java-Properties</span></a></li>' + "\n"

                                     + '    </ul>' + "\n"
                                     + '</li>';

                        app.menu_element
                            .append( core_tpl );
                    }

                    $.ajax
                    (
                        {
                            url : app.environment_basepath + '/admin/system?wt=json',
                            dataType : 'json',
                            context : $( '#environment' ),
                            beforeSend : function( arr, form, options )
                            {
                                this
                                    .show();
                                
                                loader.show( this );
                            },
                            success : function( response )
                            {
                                app.dashboard_values = response;
                                sammy.run( location.hash );

                                var environment_args = null;

                                if( response.jvm && response.jvm.jmx && response.jvm.jmx.commandLineArgs )
                                {
                                    environment_args = response.jvm.jmx.commandLineArgs.join( ' | ' )
                                                            .match( /-Dsolr.environment=((dev|test|prod)?[\w\d]*)/i );
                                }

                                if( !environment_args )
                                {
                                    this
                                        .hide();
                                }

                                if( environment_args && environment_args[1] )
                                {
                                    this
                                        .html( environment_args[1] );
                                }

                                if( environment_args && environment_args[2] )
                                {
                                    this
                                        .addClass( environment_args[2] );
                                }
                            },
                            error : function()
                            {
                                this
                                    .remove();
                            },
                            complete : function()
                            {
                                loader.hide( this );
                            }
                        }
                    );
                },
                error : function()
                {
                },
                complete : function()
                {
                }
            }
        );
    }
);  