( function ( mw, $ ) {
	/**
	 * Module containing presentation logic for the revision pointers
	 *
	 * @param {Pointer} pointer
	 * @param {string} name
	 * @constructor
	 */
	var PointerView = function ( pointer, name ) {
		this.pointer = pointer;
		this.name = name;
	};

	$.extend( PointerView.prototype, {
		/**
		 * @type {string}
		 */
		name: '',

		/**
		 * @type {Pointer}
		 */
		pointer: null,

		/**
		 * @type {jQuery}
		 */
		$html: null,

		/**
		 * Initializes the DOM element
		 */
		initialize: function () {
			this.$html = $( '<div>' )
				.addClass( 'mw-revslider-pointer mw-revslider-pointer-cursor ' + this.name );
		},

		/**
		 * @return {jQuery}
		 */
		render: function () {
			this.initialize();
			return this.getElement();
		},

		/**
		 * @return {jQuery}
		 */
		getElement: function () {
			return this.$html;
		},

		/**
		 * Returns whether a pointer is the upper/new revision pointer based on its CSS class
		 *
		 * @return {boolean}
		 */
		isUpperPointer: function () {
			return this.getElement().hasClass( 'mw-revslider-pointer-upper' );
		},

		/**
		 * Returns the offset (margin-left) depending on whether its the upper or lower pointer
		 *
		 * @return {number}
		 */
		getOffset: function () {
			return this.isUpperPointer() ? 16 : 0;
		},

		// For correct positioning of the pointer in the RTL mode the left position is flipped in the container.
		// Additionally what must be taken into consideration is the width of the revision,
		// and the extra space added on the right side of the pointer container used for correct
		// restricting the pointer dragging area
		getAdjustedLeftPositionWhenRtl: function ( pos ) {
			return this.getElement().offsetParent().width() - pos - 16 - 15;
		},

		/**
		 * Moves the pointer to a position
		 *
		 * @param {number} posInPx
		 * @param {number} duration
		 * @return {jQuery}
		 */
		animateTo: function ( posInPx, duration ) {
			var animatePos = { left: posInPx };
			if ( this.getElement().css( 'direction' ) === 'rtl' ) {
				animatePos.left = this.getAdjustedLeftPositionWhenRtl( animatePos.left );
			}
			return this.getElement().animate( animatePos, duration );
		},

		/**
		 * Slides the pointer to the revision it's pointing at
		 *
		 * @param {Slider} slider
		 * @param {number} duration
		 * @return {jQuery}
		 */
		slideToPosition: function ( slider, duration ) {
			var relativePos = this.pointer.getPosition() - slider.getFirstVisibleRevisionIndex();
			return this.animateTo( ( relativePos - 1 ) * slider.getView().revisionWidth, duration );
		},

		/**
		 * Slides the pointer to the side of the slider when it's not in the current range of revisions
		 *
		 * @param {Slider} slider
		 * @param {boolean} posBeforeSlider
		 * @param {number} duration
		 * @return {jQuery}
		 */
		slideToSide: function ( slider, posBeforeSlider, duration ) {
			if ( posBeforeSlider ) {
				return this.animateTo( this.getOffset() - 2 * slider.getView().revisionWidth, duration );
			} else {
				return this.animateTo( slider.getRevisionsPerWindow()  * slider.getView().revisionWidth + this.getOffset(), duration );
			}
		},

		/**
		 * Decides based on its position whether the pointer should be sliding to the side or to its position
		 *
		 * @param {Slider} slider
		 * @param {number} duration
		 * @return {jQuery}
		 */
		slideToSideOrPosition: function ( slider, duration ) {
			var firstVisibleRev = slider.getFirstVisibleRevisionIndex(),
				posBeforeSlider = this.pointer.getPosition() < firstVisibleRev,
				isVisible = !posBeforeSlider && this.pointer.getPosition() <= firstVisibleRev + slider.getRevisionsPerWindow();
			if ( isVisible ) {
				return this.slideToPosition( slider, duration );
			} else {
				return this.slideToSide( slider, posBeforeSlider, duration );
			}
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.PointerView = PointerView;
}( mediaWiki, jQuery ) );
