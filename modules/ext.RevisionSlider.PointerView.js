( function ( mw, $ ) {
	var PointerView = function ( pointer, id ) {
		this.pointer = pointer;
		this.id = id;
	};

	$.extend( PointerView.prototype, {
		/**
		 * @type {string}
		 */
		id: '',

		/**
		 * @type {Pointer}
		 */

		/**
		 * @type {jQuery}
		 */
		$html: null,

		initialize: function () {
			this.$html = $( '<div>' )
				.attr( 'id', this.id )
				.addClass( 'mw-pointer mw-pointer-cursor' );
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

		isUpperPointer: function () {
			return this.getElement().hasClass( 'mw-upper-pointer' );
		},

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

		animateTo: function ( posInPx, duration ) {
			var animatePos = { left: posInPx };
			if ( this.getElement().css( 'direction' ) === 'rtl' ) {
				animatePos.left = this.getAdjustedLeftPositionWhenRtl( animatePos.left );
			}
			return this.getElement().animate( animatePos, duration );
		},

		slideToPosition: function ( slider, duration ) {
			var relativePos = this.pointer.getPosition() - slider.getFirstVisibleRevisionIndex();
			return this.animateTo( ( relativePos - 1 ) * slider.getView().revisionWidth, duration );
		},

		slideToSide: function ( slider, posBeforeSlider, duration ) {
			if ( posBeforeSlider ) {
				return this.animateTo( this.getOffset() - 2 * slider.getView().revisionWidth, duration );
			} else {
				return this.animateTo( slider.getRevisionsPerWindow()  * slider.getView().revisionWidth + this.getOffset(), duration );
			}
		},

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
