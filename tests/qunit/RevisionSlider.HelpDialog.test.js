QUnit.module( 'ext.RevisionSlider.HelpDialog' );

QUnit.test( 'Initialize HelpDialog', ( assert ) => {
	const HelpDialog = require( 'ext.RevisionSlider.Slider' ).HelpDialog;
	const helpDialog = new HelpDialog(),
		windowManager = new OO.ui.WindowManager();

	$( document.body ).append( windowManager.$element );
	windowManager.addWindows( [ helpDialog ] );

	assert.strictEqual( helpDialog.slides.length, 4 );
	assert.strictEqual( helpDialog.slidePointer, 0 );

	assert.strictEqual(
		helpDialog.slides[ 0 ].$element.find( '.mw-revslider-help-dialog-text' ).text(),
		'(revisionslider-help-dialog-slide1)'
	);
	assert.strictEqual(
		helpDialog.slides[ 1 ].$element.find( '.mw-revslider-help-dialog-text' ).text(),
		'(revisionslider-help-dialog-slide2)'
	);
	assert.strictEqual(
		helpDialog.slides[ 2 ].$element.find( '.mw-revslider-help-dialog-text' ).text(),
		'(revisionslider-help-dialog-slide3a)'
	);
	assert.strictEqual(
		helpDialog.slides[ 3 ].$element.find( '.mw-revslider-help-dialog-text' ).text(),
		'(revisionslider-help-dialog-slide4)'
	);
} );
