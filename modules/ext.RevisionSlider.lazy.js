( function ( mw, $ ) {
	var settings = new mw.libs.revisionSlider.Settings(),
		autoExpand = settings.shouldAutoExpand(),
		revContainer = $( '.mw-revslider-container' );

	if ( autoExpand ) {
		mw.loader.load( 'ext.RevisionSlider.init' );
	} else {
		revContainer.on( 'click', function () {
			revContainer.off( 'click' );
			mw.loader.load( 'ext.RevisionSlider.init' );
		} );
	}

}( mediaWiki, jQuery ) );
