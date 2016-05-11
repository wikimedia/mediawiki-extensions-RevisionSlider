( function ( mw ) {
	var PointerView = mw.libs.revisionSlider.PointerView;

	QUnit.module( 'ext.RevisionSlider.Revision' );

	QUnit.test( 'Initialize PointerView', function ( assert ) {
		assert.ok( ( new PointerView( null, 'left-pointer' ) ).render().find( '.left-pointer' ) );
	} );

	QUnit.test( 'Has offset', function ( assert ) {
		var offset = 30,
			pointer = new PointerView( null, 'left-pointer', offset );

		assert.equal( pointer.getOffset(), offset );
	} );

} )( mediaWiki );
