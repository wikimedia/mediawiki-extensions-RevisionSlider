/**
 * Module containing presentation logic for the revision pointers
 *
 * @class PointerView
 * @param {Pointer} pointer
 * @param {string} name
 * @constructor
 */
function PointerView( pointer, name ) {
	this.pointer = pointer;
	this.name = name;
}

Object.assign( PointerView.prototype, {
	/**
	 * @type {string}
	 */
	name: '',

	/**
	 * @type {Pointer}
	 */
	pointer: null,

	/**
	 * @type {jQuery|null}
	 */
	$html: null,

	/**
	 * @return {jQuery}
	 */
	getElement: function () {
		if ( !this.$html ) {
			// eslint-disable-next-line mediawiki/class-doc
			this.$html = $( '<div>' )
				.addClass( 'mw-revslider-pointer mw-revslider-pointer-cursor ' + this.name );
		}
		return this.$html;
	},

	/**
	 * Returns whether a pointer is the newer revision pointer based on its CSS class
	 *
	 * @return {boolean}
	 */
	isNewerPointer: function () {
		return this.$html.hasClass( 'mw-revslider-pointer-newer' );
	},

	// For correct positioning of the pointer in the RTL mode the left position is flipped in the container.
	// 30 pixel have to be added to cover the arrow and its margin.
	getAdjustedLeftPositionWhenRtl: function ( pos ) {
		return this.$html.offsetParent().width() - pos - 30;
	},

	/**
	 * Sets the HTML attribute for the position
	 *
	 * @param {number} pos
	 */
	setDataPositionAttribute: function ( pos ) {
		this.getElement().attr( 'data-pos', pos );
	},

	/**
	 * Moves the pointer to a position
	 *
	 * @private
	 * @param {number} posInPx
	 * @param {number} revisionWidth
	 * @param {number} [baseDuration] Duration per revisionWidth, is adjusted by log() distance
	 * @return {jQuery}
	 */
	animateTo: function ( posInPx, revisionWidth, baseDuration ) {
		const animatePos = { left: posInPx },
			currentPos = this.$html.position();

		baseDuration = typeof baseDuration !== 'undefined' ? baseDuration : 100;
		if ( this.$html.css( 'direction' ) === 'rtl' ) {
			animatePos.left = this.getAdjustedLeftPositionWhenRtl( animatePos.left );
		}
		const distance = Math.abs( animatePos.left - currentPos.left ) / revisionWidth;
		const duration = baseDuration * Math.log( 5 + distance );
		// eslint-disable-next-line no-jquery/no-animate
		return this.$html.animate( animatePos, duration, 'linear' );
	},

	/**
	 * Slides the pointer to the revision it's pointing at
	 *
	 * @private
	 * @param {Slider} slider
	 * @param {number} [duration]
	 * @return {jQuery}
	 */
	slideToPosition: function ( slider, duration ) {
		const relativePos = this.pointer.getPosition() - slider.getOldestVisibleRevisionIndex();
		return this.animateTo( ( relativePos - 1 ) * slider.getView().revisionWidth, slider.getView().revisionWidth, duration );
	},

	/**
	 * Slides the pointer to the side of the slider when it's not in the current range of revisions
	 *
	 * @private
	 * @param {Slider} slider
	 * @param {boolean} posBeforeSlider
	 * @param {number} [duration]
	 * @return {jQuery}
	 */
	slideToSide: function ( slider, posBeforeSlider, duration ) {
		const margin = this.isNewerPointer() ? 16 : 0;
		let x = slider.getView().revisionWidth;
		x *= posBeforeSlider ? -2 : slider.getRevisionsPerWindow();
		return this.animateTo( x + margin, slider.getView().revisionWidth, duration );
	},

	/**
	 * Decides based on its position whether the pointer should be sliding to the side or to its position
	 *
	 * @param {Slider} slider
	 * @param {number} [duration]
	 * @return {jQuery}
	 */
	slideToSideOrPosition: function ( slider, duration ) {
		const firstVisibleRev = slider.getOldestVisibleRevisionIndex(),
			posBeforeSlider = this.pointer.getPosition() < firstVisibleRev,
			isVisible = !posBeforeSlider && this.pointer.getPosition() <= firstVisibleRev + slider.getRevisionsPerWindow();
		if ( isVisible ) {
			return this.slideToPosition( slider, duration );
		} else {
			return this.slideToSide( slider, posBeforeSlider, duration );
		}
	}
} );

module.exports = PointerView;
