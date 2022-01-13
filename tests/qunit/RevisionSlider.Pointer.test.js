var Pointer = require( 'ext.RevisionSlider.Slider' ).private.Pointer;

QUnit.module( 'ext.RevisionSlider.Pointer' );

QUnit.test( 'Initialize Pointer', function ( assert ) {
	assert.true( ( new Pointer( 'mw-revslider-pointer' ) ).getView().render().hasClass( 'mw-revslider-pointer' ) );
} );

QUnit.test( 'Set and get position', function ( assert ) {
	var pointer = new Pointer(),
		pos = 42;

	pointer.setPosition( pos );
	assert.strictEqual( pointer.getPosition(), pos );
} );
