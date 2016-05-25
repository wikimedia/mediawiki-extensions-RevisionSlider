( function ( mw, $ ) {
	var PointerView = function ( pointer, id, offset ) {
		this.pointer = pointer;
		this.id = id;
		this.offset = offset;
	};

	$.extend( PointerView.prototype, {
		/**
		 * @type {string}
		 */
		id: '',

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
			this.$html = $( '<div id="' + this.id + '" class="pointer" />' );
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
			return this.getElement().animate( { left: posInPx }, duration );
		},

		slideToPosition: function ( slider, duration ) {
			var relativePos = this.pointer.getPosition() - slider.getFirstVisibleRevisionIndex();
			return this.animateTo( relativePos * slider.getView().revisionWidth + 4, duration ); // +4 to align triangle and revision
		},

		slideToSide: function ( slider, posBeforeSlider, duration ) {
			if ( posBeforeSlider ) {
				return this.animateTo( this.offset - slider.getView().revisionWidth + 20, duration ); // +20 otherwise pointer is in arrow
			} else {
				return this.animateTo( ( slider.getRevisionsPerWindow() + 1 ) * slider.getView().revisionWidth - this.offset, duration );
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
