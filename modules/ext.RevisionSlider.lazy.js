( function () {
	var settings = new mw.libs.revisionSlider.Settings(),
		autoExpand = settings.shouldAutoExpand();

	if ( autoExpand ) {
		mw.loader.load( 'ext.RevisionSlider.init' );
	} else {
		$( '.mw-revslider-toggle-button' ).click(
			function () {
				mw.loader.load( 'ext.RevisionSlider.init' );
			}
		);
	}
	$( '.mw-revslider-toggle-button' ).keypress( function ( event ) {
		if ( event.which === 13 || event.which === 32 ) {
			event.preventDefault();
			$( '.mw-revslider-toggle-button' ).click();
		}
	} );

}() );
