( function () {
	var PointerView = mw.libs.revisionSlider.PointerView;

	QUnit.module( 'ext.RevisionSlider.PointerView' );

	QUnit.test( 'Initialize PointerView', function ( assert ) {
		assert.ok( ( new PointerView( null, 'mw-revslider-pointer' ) ).render().hasClass( 'mw-revslider-pointer' ) );
	} );

	QUnit.test( 'Is newer pointer', function ( assert ) {
		var pv = new PointerView( null, 'mw-revslider-pointer' );
		pv.render();
		assert.notOk( pv.isNewerPointer() );

		pv.getElement().addClass( 'mw-revslider-pointer-newer' );
		assert.ok( pv.isNewerPointer() );
	} );

	QUnit.test( 'Has offset', function ( assert ) {
		var pv = new PointerView( null, 'mw-revslider-pointer' );
		pv.render();
		assert.strictEqual( pv.getOffset(), 0 );

		pv.getElement().addClass( 'mw-revslider-pointer-newer' );
		assert.strictEqual( pv.getOffset(), 16 );
	} );
}() );
