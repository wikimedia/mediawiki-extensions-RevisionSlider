( function ( mw ) {
	var PointerView = mw.libs.revisionSlider.PointerView;

	QUnit.module( 'ext.RevisionSlider.Revision' );

	QUnit.test( 'Initialize PointerView', function ( assert ) {
		assert.ok( ( new PointerView( 'left-pointer' ) ).render().find( '.left-pointer' ) );
	} );

	QUnit.test( 'Has offset', function ( assert ) {
		var offset = 30,
			pointer = new PointerView( 'left-pointer', offset );

		assert.equal( pointer.getOffset(), offset );
	} );

} )( mediaWiki );
