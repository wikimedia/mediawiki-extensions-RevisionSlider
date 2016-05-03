( function ( mw, $ ) {
	var PointerView = function ( cssClass, offset ) {
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
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.PointerView = PointerView;
}( mediaWiki, jQuery ) );
