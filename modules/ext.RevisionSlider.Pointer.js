/**
 * @external PointerLine
 * @external PointerView
 */
( function () {
	/**
	 * Module containing logic for the revision pointers
	 *
	 * @class Pointer
	 * @param {string} name
	 * @constructor
	 */
	var Pointer = function ( name ) {
		this.view = new mw.libs.revisionSlider.PointerView( this, name );
		this.line = new mw.libs.revisionSlider.PointerLine( this, name );
	};

	/**
	 * @class mw.libs.revisionSlider.Pointer
	 */
	$.extend( Pointer.prototype, {
		/**
		 * @type {number}
		 */
		position: 0,

		/**
		 * @type {PointerView}
		 */
		view: null,

		/**
		 * @type {PointerLine}
		 */
		line: null,

		/**
		 * @param {number} p
		 */
		setPosition: function ( p ) {
			this.position = p;
			this.getView().setDataPositionAttribute( p );
		},

		/**
		 * @return {number}
		 */
		getPosition: function () {
			return this.position;
		},

		/**
		 * @return {PointerView}
		 */
		getView: function () {
			return this.view;
		},

		/**
		 * @return {PointerLine}
		 */
		getLine: function () {
			return this.line;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Pointer = Pointer;
}() );
