( function () {
	var Pointer = require( 'ext.RevisionSlider.Pointer' ).Pointer;

	QUnit.module( 'ext.RevisionSlider.Pointer' );

	QUnit.test( 'Initialize Pointer', function ( assert ) {
		assert.ok( ( new Pointer( 'mw-revslider-pointer' ) ).getView().render().hasClass( 'mw-revslider-pointer' ) );
	} );

	QUnit.test( 'Set and get position', function ( assert ) {
		var pointer = new Pointer(),
			pos = 42;

		pointer.setPosition( pos );
		assert.strictEqual( pointer.getPosition(), pos );
	} );

}() );
