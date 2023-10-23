( function () {
	const PointerView = require( 'ext.RevisionSlider.Slider' ).private.PointerView;

	QUnit.module( 'ext.RevisionSlider.PointerView' );

	QUnit.test( 'Initialize PointerView', function ( assert ) {
		assert.true( ( new PointerView( null, 'mw-revslider-pointer' ) ).render().hasClass( 'mw-revslider-pointer' ) );
	} );

	QUnit.test( 'Is newer pointer', function ( assert ) {
		const pv = new PointerView( null, 'mw-revslider-pointer' );
		pv.render();
		assert.false( pv.isNewerPointer() );

		pv.getElement().addClass( 'mw-revslider-pointer-newer' );
		assert.true( pv.isNewerPointer() );
	} );
}() );
