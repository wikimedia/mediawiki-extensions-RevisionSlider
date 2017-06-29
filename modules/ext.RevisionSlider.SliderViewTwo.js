( function ( mw, $ ) {
	/**
	 * Module handling the view logic of the RevisionSlider slider with two slides
	 *
	 * @param {Slider} slider
	 * @constructor
	 */
	var SliderViewTwo = function ( slider ) {
		this.slider = slider;
		this.diffPage = new mw.libs.revisionSlider.DiffPage( this.slider.getRevisions() );
	};

	OO.inheritClass( SliderViewTwo, mw.libs.revisionSlider.SliderView );

	$.extend( SliderViewTwo.prototype, {

		setPointerDragCursor: function () {
			$( '.mw-revslider-pointer, ' +
				'.mw-revslider-pointer-container, ' +
				'.mw-revslider-pointer-container-newer, ' +
				'.mw-revslider-pointer-container-older, ' +
				'.mw-revslider-pointer-line, ' +
				'.mw-revslider-revision-wrapper' )
				.addClass( 'mw-revslider-pointer-grabbing' );
		},

		removePointerDragCursor: function () {
			$( '.mw-revslider-pointer, ' +
				'.mw-revslider-pointer-container, ' +
				'.mw-revslider-pointer-container-newer, ' +
				'.mw-revslider-pointer-container-older, ' +
				'.mw-revslider-pointer-line, ' +
				'.mw-revslider-revision-wrapper' )
				.removeClass( 'mw-revslider-pointer-grabbing' );
		},

		resetPointerColorsBasedOnValues: function () {
		},

		revisionWrapperClickHandler: function () {
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderViewTwo = SliderViewTwo;
}( mediaWiki, jQuery ) );
