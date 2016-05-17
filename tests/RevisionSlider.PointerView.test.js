( function ( mw ) {
	var PointerView = mw.libs.revisionSlider.PointerView;

	QUnit.module( 'ext.RevisionSlider.PointerView' );

	QUnit.test( 'Initialize PointerView', function ( assert ) {
		assert.ok( ( new PointerView( null, 'revslider-pointer' ) ).render().hasClass( 'pointer' ) );
	} );

	QUnit.test( 'Has offset', function ( assert ) {
		var offset = 30,
			pointer = new PointerView( null, 'revslider-pointer', offset );

		assert.equal( pointer.getOffset(), offset );
	} );

} )( mediaWiki );
