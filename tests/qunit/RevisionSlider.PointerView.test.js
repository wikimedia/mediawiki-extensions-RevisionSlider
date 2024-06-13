( function () {
	const PointerView = require( 'ext.RevisionSlider.Slider' ).private.PointerView;

	QUnit.module( 'ext.RevisionSlider.PointerView' );

	QUnit.test( 'Initialize PointerView', ( assert ) => {
		assert.true( ( new PointerView( null, 'mw-revslider-pointer' ) ).getElement().hasClass( 'mw-revslider-pointer' ) );
	} );

	QUnit.test( 'Is newer pointer', ( assert ) => {
		const pv = new PointerView( null, 'mw-revslider-pointer' );
		pv.getElement();
		assert.false( pv.isNewerPointer() );

		pv.getElement().addClass( 'mw-revslider-pointer-newer' );
		assert.true( pv.isNewerPointer() );
	} );
}() );
