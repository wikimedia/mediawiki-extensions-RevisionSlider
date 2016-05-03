( function ( mw ) {
	var Pointer = mw.libs.revisionSlider.Pointer;

	QUnit.module( 'ext.RevisionSlider.Revision' );

	QUnit.test( 'Initialize Pointer', function ( assert ) {
		assert.ok( ( new Pointer( 'left-pointer' ) ).getView().render().find( '.left-pointer' ) );
	} );

	QUnit.test( 'Set and get position', function ( assert ) {
		var pointer = new Pointer(),
			pos = 42;

		pointer.setPosition( pos );
		assert.equal( pointer.getPosition(), pos );
	} );

} )( mediaWiki );
