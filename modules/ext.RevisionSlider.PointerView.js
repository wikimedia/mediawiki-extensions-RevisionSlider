( function ( mw, $ ) {
	var PointerView = function ( pointer, cssClass, offset ) {
		this.pointer = pointer;
		this.cssClass = cssClass;
		this.offset = offset;
	};

	$.extend( PointerView.prototype, {
		/**
		 * @type {string}
		 */
		cssClass: '',

		/**
		 * @type {int}
		 */
		offset: 0,

		/**
		 * @type {Pointer}
		 */

		/**
		 * @type {jQuery}
		 */
		$html: null,

		initialize: function () {
			this.$html = $( '<div class="pointer" />' ).addClass( this.cssClass );
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

		getOffset: function () {
			return this.offset;
		},

		animateTo: function ( posInPx, duration ) {
			this.getElement().animate( { left: posInPx }, duration );
		},

		slideToPosition: function ( slider, duration ) {
			var relativePos = this.pointer.getPosition() - slider.slider.getFirstVisibleRevisionIndex();
			this.animateTo( relativePos * slider.revisionWidth, duration );
		},

		slideToSide: function ( slider, posBeforeSlider, duration ) {
			if ( posBeforeSlider ) {
				this.animateTo( this.offset - slider.revisionWidth, duration );
			} else {
				this.animateTo( ( slider.slider.getRevisionsPerWindow() + 1 ) * slider.revisionWidth - this.offset, duration );
			}
		},

		slideToSideOrPosition: function ( slider, duration ) {
			var firstVisibleRev = slider.slider.getFirstVisibleRevisionIndex(),
				posBeforeSlider = this.pointer.getPosition() < firstVisibleRev,
				isVisible = !posBeforeSlider && this.pointer.getPosition() <= firstVisibleRev + slider.slider.getRevisionsPerWindow();
			if ( isVisible ) {
				this.slideToPosition( slider, duration );
			} else {
				this.slideToSide( slider, posBeforeSlider, duration );
			}
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.PointerView = PointerView;
}( mediaWiki, jQuery ) );
