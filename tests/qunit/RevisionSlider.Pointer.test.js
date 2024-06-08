( function () {
	const Pointer = require( 'ext.RevisionSlider.Slider' ).private.Pointer;

	QUnit.module( 'ext.RevisionSlider.Pointer' );

	QUnit.test( 'Initialize Pointer', ( assert ) => {
		assert.true( ( new Pointer( 'mw-revslider-pointer' ) ).getView().getElement().hasClass( 'mw-revslider-pointer' ) );
	} );

	QUnit.test( 'Set and get position', ( assert ) => {
		const pointer = new Pointer(),
			pos = 42;

		pointer.setPosition( pos );
		assert.strictEqual( pointer.getPosition(), pos );
	} );
}() );
