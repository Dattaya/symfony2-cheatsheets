var startPath = $( "#navbar a" ).first().attr( "href" );
var previousPath;

var normalizePath = function( path ) {
    if ( !path ) {
        return;
    }
    return "#" + path.split( "#" )[1];
};

var getHash = function( path ) {
    var hash = path.split( "#" )[2];
    if ( hash ) {
        return "#" + hash;
    }
};

// SIDEBAR
// Toggle sidebar active link
amplify.subscribe( "sidebar_loaded", function() {
    $( "#sidebar" )
        .children( ".active" )
        .removeClass( "active" )
    .end()
        .find( "li:has(a[href='" + normalizePath( location.hash ) + "'])" )
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
        .scrollspy( { target: "#subnav", offset: 100 } )
        .scrollspy( "refresh" );

    amplify.publish( "smooth_scroll_to_content" );

    if ( !getHash( location.hash ) ) {
        $lis.first().addClass( "active" );
    }

}, 5 );

// Change location.hash
$( "#main" ).on( "click", "#subnav a", function( e ) {

    e.preventDefault();
    location.hash = normalizePath( location.hash ) + this.hash;
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

// Smooth scroll to content
amplify.subscribe( "smooth_scroll_to_content", function() {
    $.smoothScroll( {
        scrollTarget: getHash( location.hash )
    } );
} );

var hashChangedByUserScrolling = false;

// Change location hash while user is scrolling and set flag to prevent loading of content
$( "#main" ).on( "activate", "#subnav li", function() {
    var newPath = normalizePath( location.hash ) + $( this ).children( "a" ).attr( "href" );
    if ( location.hash === newPath ) {
        return;
    }
    hashChangedByUserScrolling = true;
    location.hash = newPath;
} );

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
$( window ).on( "hashchange", function() {

    // Path was not changed but hash was
    if ( normalizePath( previousPath ) === normalizePath( location.hash ) ) {
        previousPath = location.hash;
        if ( !hashChangedByUserScrolling ) {
            amplify.publish( "smooth_scroll_to_content" );
        }
        hashChangedByUserScrolling = false;
        return;
    }
    previousPath = location.hash;
    var normalized = normalizePath( location.hash );

    $( "#sidebar" ).load( normalized.substr( 1, location.hash.lastIndexOf( "/" ) ) + "menu.html",
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
    location.hash = startPath;
} else {
    $( window ).trigger( "hashchange" );
}
