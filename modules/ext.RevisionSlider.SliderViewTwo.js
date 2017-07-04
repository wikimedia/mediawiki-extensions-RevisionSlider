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

		revisionWrapperClickHandler: function () {
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderViewTwo = SliderViewTwo;
}( mediaWiki, jQuery ) );
