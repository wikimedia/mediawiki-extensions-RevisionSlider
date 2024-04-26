QUnit.module( 'ext.RevisionSlider.HelpDialog' );

QUnit.test( 'Initialize HelpDialog', function ( assert ) {
	const HelpDialog = require( 'ext.RevisionSlider.Slider' ).HelpDialog;
	const helpDialog = new HelpDialog(),
		windowManager = new OO.ui.WindowManager();

	function getSlideTextHtml( slide ) {
		return slide.$element.find( '.mw-revslider-help-dialog-text' ).html();
	}

	function addLinkTargets( message ) {
		const $container = $( '<div>' ).append(
			// eslint-disable-next-line mediawiki/msg-doc
			mw.message( message ).parseDom()
		);
		$container.find( 'a' ).attr( 'target', '_blank' );
		return $container.html();
	}

	$( document.body ).append( windowManager.$element );
	windowManager.addWindows( [ helpDialog ] );

	assert.strictEqual( helpDialog.slides.length, 4 );
	assert.strictEqual( helpDialog.slidePointer, 0 );
	assert.strictEqual(
		getSlideTextHtml( helpDialog.slides[ 0 ] ),
		addLinkTargets( 'revisionslider-help-dialog-slide1' )
	);
	assert.strictEqual(
		getSlideTextHtml( helpDialog.slides[ 1 ] ),
		addLinkTargets( 'revisionslider-help-dialog-slide2' )
	);
	assert.strictEqual(
		getSlideTextHtml( helpDialog.slides[ 2 ] ),
		addLinkTargets( 'revisionslider-help-dialog-slide3a' )
	);
	assert.strictEqual(
		getSlideTextHtml( helpDialog.slides[ 3 ] ),
		addLinkTargets( 'revisionslider-help-dialog-slide4' )
	);
} );
