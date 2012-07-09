var getPath = function( path ) {
    if ( path ) {
        if ( getSubPath( path ) ) {
            return path.substring( 0, path.lastIndexOf( "/" ) );
        }
        return path;
    }
};

var getSubPath = function( path ) {
    if ( path.match( /\.html$/ ) ) {
        return "";
    }
    return path.substr( path.lastIndexOf( "/" ) + 1 );
};

// SIDEBAR
// Toggle sidebar active link
amplify.subscribe( "sidebar_loaded", function() {
    $( "#sidebar" )
        .children( ".active" )
        .removeClass( "active" )
    .end()
        .find( "li:has(a[href='" + getPath( location.hash ) + "'])" )
        .addClass( "active" );
} );


// NAVBAR
// Toggle navbar active link
amplify.subscribe( "content_loaded", function() {
    $( "#navbar" )
        .children( "li" )
        .removeClass( "active" )
        .has( "a[href^='" + location.hash.split( "/" )[0] + "']" )
        .addClass( "active" );
}, 1 );


// SUBNAV - under h1 tag
// Build subnav bar
amplify.subscribe( "content_loaded", function() {
    var $lis = $( "#main h2" ).map( function() {
        var $h2 = $( this );
        var id = $h2.text().replace( new RegExp( "[\\s]+", "g" ), "_" ).replace( new RegExp( "[@;,&/]+", "g" ), "" );

        $h2.attr( "id", id );

        return $( "<li>" )
            .prepend( $( "<a>", {
            href: "#" + id,
            text: $h2.text()
        } ) ).get();
    } );

    var $ul = $( "<ul>" )
        .addClass( "nav nav-pills subnav" )
        .prepend( $lis );
    $( "<div>", { id: "subnav" } )
        .prepend( $ul )
        .insertAfter( $( "#main h1" ) );

    $lis.children( "a" ).smoothScroll();

    $( "body" )
        .scrollspy( { target: "#subnav", offset: 130 } )
        .scrollspy( "refresh" );

    if ( getSubPath( location.hash ) ) {
        scrollToContent( "#" + getSubPath( location.hash ) );
    } else {
        $lis.first().addClass( "active" );
    }
}, 5 );

// Change location.hash
$( "#main" ).on( "click", "#subnav a", function( e ) {
    e.preventDefault();
    if ( $( this ).closest( "li" ).index() === 0 ) {
        location.hash = getPath( location.hash );
        return;
    }
    location.hash = getPath( location.hash ) + "/" + this.hash.slice( 1 );
} );

// keep subnav bar on top
$( document ).scroll( function() {
    var subnav = $( ".nav-pills" );

    if ( !subnav.data( "top" ) ) {
        subnav.data( "top", subnav.offset().top );
        subnav.data( "left", subnav.offset().left );
    }

    if ( subnav.data( 'top' ) - subnav.outerHeight() <= $( this ).scrollTop() )
        subnav.addClass( 'subnav-fixed' );
    else {
        subnav.removeClass( 'subnav-fixed' );
    }
} );


// CONTENT
// Make enough space to scroll to the last header
amplify.subscribe( "content_loaded", function() {
    $( "body" ).css( "height", $( document ).height() + $( window ).height() );
}, 2 );

// Make tables sortable
amplify.subscribe( "content_loaded", function() {
    $( "table" ).sortableTable();
    $( "th:first-child" ).trigger( "click" );
}, 2 );

// Highlight code
amplify.subscribe( "content_loaded", function() {
    $( "script[type=yaml]" ).attr( "type", "php" );
    $( "script[type=twig]" ).attr( "type", "django" );

    $( "script[type=javascript], script[type=php], script[type=django]" )
        .each( function() {
            var $pre = $( this )
                .wrapInner( function() {
                    return $("<code>" ).addClass( $( this ).attr( "type" ) )
                } )
                .wrapInner( "<pre>" )
                .children( "pre" );
            $pre.closest( "td" ).prepend( $pre );
    } );

    $( 'pre code' ).each( function() {
        $( this ).append( "<br>" );
        hljs.highlightBlock( this );
    } );
}, 3 );

// Transform code examples to buttons
amplify.subscribe( "content_loaded", function() {

    $( "th:contains(Example)" ).off( "click" ).addClass( "default-cursor" );

    $( "pre:has(code)" )
        .addClass( "hide" )
            .closest( "td" )
            .prepend( "<a class=\"badge\">+</a>" )
                .children( "a" )
                .on( "click", function( e ) {
                    e.preventDefault();
                    $( ".modal-body" ).html( $( this ).siblings( "pre" ).clone().removeClass( "hide" ) );
                    $( "#modal" ).modal();
        } );
}, 4 );

// Show popovers for [data-content]
amplify.subscribe( "content_loaded", function() {
    $( "[data-content]" )
        .each( function() {
            $( this )
                .addClass("popup")
                .popover( { placement: "bottom", title: $( this ).text() } );
        } )
}, 6);

var scrollingToContent = false;

var scrollToContent = function ( target ) {
    scrollingToContent = true;
    $.smoothScroll( {
        scrollTarget: target,
        afterScroll: function() {
            scrollingToContent = false;
        }
    } );
};

// Change location hash while user is scrolling and set flag to prevent loading of content

// Decided not to use `activate` event. In some cases `activate` event fired before `hashchange`,
// when a user pressed 'back'/'forward' button, so location.hash can't be changed here.
// Instead setInterval is used.
//$( "#main" ).on( "activate", "#subnav li", function() {
//    if ( !scrollingToContent ) {
//        hashChangedByUserScrolling = true;
//        location.hash = normalizePath( location.hash ) + "/" + $( this ).children( "a" ).attr( "href" ).slice( 1 );
//
//    }
//} );

var hashChangedByUserScrolling = false;
setInterval( function() {
    var $active = $( "#subnav .active" );

    if ( scrollingToContent || $active.length === 0 ) {
        return;
    }

    if ( $active.index() === 0 ) {
        if ( getSubPath( location.hash ) ) {
            location.hash = getPath( location.hash );
            hashChangedByUserScrolling = true;
        }
        return;
    }

    var $a = $active.children( "a" ),
        href = $a.attr( "href" ).slice( 1 );

    if ( href === getSubPath( location.hash ) ) {
        return;
    }

    hashChangedByUserScrolling = true;
    location.hash = getPath( location.hash ) + "/" + $a.attr( "href" ).slice( 1 );
}, 1500 );

// Makes tables sortable
$.fn.sortableTable = function() {
    $( this ).find( "th" ).each( function() {
        var inverse = false;
        $( this ).click( function() {

            $( this )
                .closest( "table" )
                .find( "td:nth-child(" + ( $( this ).index() + 1 ) + ")" )
                .sortElements( function( a, b ) {
                    a = $( a ).text();
                    b = $( b ).text();

                    return (
                        isNaN( a ) || isNaN( b ) ?
                            a > b : +a > +b
                        ) ?
                        inverse ? -1 : 1 :
                        inverse ? 1 : -1;

                }, function() {
                    return this.parentNode;
                } );

            inverse = !inverse;
        } );
    } );
    return this;
};


// HASH CHANGE EVENT
var previousPath;
$( window ).on( "hashchange", function() {
    // Path part of a hash was not changed but hash part was
    if ( getPath( previousPath ) === getPath( location.hash ) ) {
        if ( !hashChangedByUserScrolling ) {
            scrollToContent( "#" + getSubPath( location.hash ) );
        }
        hashChangedByUserScrolling = false;
        return;
    }

    previousPath = location.hash;
    var normalized = getPath( location.hash );

    $( "#sidebar" ).load( normalized.substr( 1, normalized.lastIndexOf( "/" ) ) + "menu.html",
        function(response, code) {
            if ( code === "error" ) {
                return;
            }

            amplify.publish( "sidebar_loaded" );
        }
    );

    $( "#main" ).load( normalized.substr( 1 ),
        function(response, code) {
            if ( code === "error" ) {
                return;
            }

            amplify.publish( "content_loaded" );
        }
    );
} );

// BOOTSTRAP
if ( !location.hash ) {
    location.hash = $( "#navbar a" ).first().attr( "href" );
} else {
    $( window ).trigger( "hashchange" );
}
