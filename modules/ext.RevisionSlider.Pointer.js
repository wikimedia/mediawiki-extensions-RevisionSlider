const PointerLine = require( './ext.RevisionSlider.PointerLine.js' ),
	PointerView = require( './ext.RevisionSlider.PointerView.js' );

/**
 * Module containing logic for the revision pointers
 *
 * @class Pointer
 * @param {string} name
 * @constructor
 */
function Pointer( name ) {
	this.view = new PointerView( this, name );
	this.line = new PointerLine( this, name );
}

Object.assign( Pointer.prototype, {
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

module.exports = Pointer;
