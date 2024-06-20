const SliderView = require( './ext.RevisionSlider.SliderView.js' );

/**
 * Module handling the slider logic of the RevisionSlider
 *
 * @class Slider
 * @param {RevisionList} revisions
 * @constructor
 */
function Slider( revisions ) {
	this.revisions = revisions;
	this.view = new SliderView( this );
}

Object.assign( Slider.prototype, {
	/**
	 * @type {RevisionList}
	 */
	revisions: null,

	/**
	 * @type {number}
	 */
	oldestVisibleRevisionIndex: 0,

	/**
	 * @type {number}
	 */
	revisionsPerWindow: 0,

	/**
	 * @type {SliderView}
	 */
	view: null,

	/**
	 * @return {RevisionList}
	 */
	getRevisionList: function () {
		return this.revisions;
	},

	/**
	 * @return {SliderView}
	 */
	getView: function () {
		return this.view;
	},

	/**
	 * Sets the number of revisions that are visible at once (depending on browser window size)
	 *
	 * @param {number} n
	 */
	setRevisionsPerWindow: function ( n ) {
		this.revisionsPerWindow = Math.round( n );
	},

	/**
	 * @return {number}
	 */
	getRevisionsPerWindow: function () {
		return this.revisionsPerWindow;
	},

	/**
	 * Returns the index of the oldest revision that is visible in the current window
	 *
	 * @return {number}
	 */
	getOldestVisibleRevisionIndex: function () {
		return this.oldestVisibleRevisionIndex;
	},

	/**
	 * Returns the index of the newest revision that is visible in the current window
	 *
	 * @return {number}
	 */
	getNewestVisibleRevisionIndex: function () {
		return this.oldestVisibleRevisionIndex + this.revisionsPerWindow - 1;
	},

	/**
	 * @return {boolean}
	 */
	isAtStart: function () {
		return this.getOldestVisibleRevisionIndex() <= 0 ||
			this.revisions.getLength() <= this.revisionsPerWindow;
	},

	/**
	 * @return {boolean}
	 */
	isAtEnd: function () {
		return this.getNewestVisibleRevisionIndex() >= this.revisions.getLength() - 1 ||
			this.revisions.getLength() <= this.revisionsPerWindow;
	},

	/**
	 * Sets the index of the first revision that is visible in the current window
	 *
	 * @param {number} value
	 */
	setFirstVisibleRevisionIndex: function ( value ) {
		const highestPossibleFirstRev = this.revisions.getLength() - this.revisionsPerWindow;
		value = Math.min( Math.max( 0, value ), highestPossibleFirstRev );
		this.oldestVisibleRevisionIndex = value;
	},

	/**
	 * Sets the new oldestVisibleRevisionIndex after sliding in a direction
	 *
	 * @param {number} direction - Either -1, 0 or 1
	 */
	slide: function ( direction ) {
		const value = this.oldestVisibleRevisionIndex + direction * this.revisionsPerWindow;
		this.setFirstVisibleRevisionIndex( value );
	}
} );

module.exports = {
	Api: require( './ext.RevisionSlider.Api.js' ),
	DiffPage: require( './ext.RevisionSlider.DiffPage.js' ),
	HelpDialog: require( './ext.RevisionSlider.HelpDialog.js' ),
	makeRevisions: require( './ext.RevisionSlider.RevisionList.js' ).makeRevisions,
	Revision: require( './ext.RevisionSlider.Revision.js' ).Revision,
	RevisionList: require( './ext.RevisionSlider.RevisionList.js' ).RevisionList,
	RevisionListView: require( './ext.RevisionSlider.RevisionListView.js' ),
	setUserOffset: require( './ext.RevisionSlider.Revision.js' ).setUserOffset,
	Slider: Slider,
	SliderView: SliderView,
	utils: require( './ext.RevisionSlider.util.js' ),

	private: {
		Pointer: require( './ext.RevisionSlider.Pointer.js' ),
		PointerView: require( './ext.RevisionSlider.PointerView.js' )
	}
};
