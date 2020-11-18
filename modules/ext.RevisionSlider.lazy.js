var Settings = require( 'ext.RevisionSlider.Settings' ),
	settings = new Settings(),
	autoExpand = settings.shouldAutoExpand();

if ( autoExpand ) {
	mw.loader.load( 'ext.RevisionSlider.init' );
} else {
	$( '.mw-revslider-toggle-button' ).on( 'click',
		function () {
			mw.loader.load( 'ext.RevisionSlider.init' );
		}
	);
}
$( '.mw-revslider-toggle-button' ).on( 'keypress', function ( event ) {
	if ( event.which === 13 || event.which === 32 ) {
		event.preventDefault();
		$( '.mw-revslider-toggle-button' ).trigger( 'click' );
	}
} );
