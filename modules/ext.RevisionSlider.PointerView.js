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

		isUpperPointer: function () {
			return this.getElement().hasClass( 'upper-pointer' );
		},

		getOffset: function () {
			return this.isUpperPointer() ? 16 : 0;
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
				return this.animateTo( this.getOffset() - ( slider.getView().revisionWidth / 2 ), duration ); // +10 otherwise pointer is in arrow
			} else {
				return this.animateTo( ( slider.getRevisionsPerWindow() + 1 ) * slider.getView().revisionWidth + this.getOffset(), duration );
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
