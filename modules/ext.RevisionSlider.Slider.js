( function ( mw, $ ) {
	/**
	 * Module handling the slider logic of the RevisionSlider
	 *
	 * @param {RevisionList} revisions
	 * @constructor
	 */
	var Slider = function ( revisions ) {
		this.revisions = revisions;
		this.view = new mw.libs.revisionSlider.SliderView( this );
	};

	$.extend( Slider.prototype, {
		/**
		 * @type {RevisionList}
		 */
		revisions: null,

		/**
		 * @type {number}
		 */
		firstVisibleRevisionIndex: 0,

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
		getRevisions: function () {
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
			this.revisionsPerWindow = n;
		},

		/**
		 * @return {number}
		 */
		getRevisionsPerWindow: function () {
			return this.revisionsPerWindow;
		},

		/**
		 * Returns the index of the first revision that is visible in the current window
		 *
		 * @return {number}
		 */
		getFirstVisibleRevisionIndex: function () {
			return this.firstVisibleRevisionIndex;
		},

		/**
		 * Returns the index of the last revision that is visible in the current window
		 *
		 * @return {number}
		 */
		getLastVisibleRevisionIndex: function () {
			return this.firstVisibleRevisionIndex + this.revisionsPerWindow - 1;
		},

		/**
		 * @return {boolean}
		 */
		isAtStart: function () {
			return this.getFirstVisibleRevisionIndex() === 0 || this.revisions.getLength() <= this.revisionsPerWindow;
		},

		/**
		 * @return {boolean}
		 */
		isAtEnd: function () {
			return this.getLastVisibleRevisionIndex() === this.revisions.getLength() - 1 || this.revisions.getLength() <= this.revisionsPerWindow;
		},

		/**
		 * Sets the index of the first revision that is visible in the current window
		 *
		 * @param {number} value
		 */
		setFirstVisibleRevisionIndex: function ( value ) {
			this.firstVisibleRevisionIndex = value;
		},

		/**
		 * Sets the new firstVisibleRevisionIndex after sliding in a direction
		 *
		 * @param {number} direction - Either -1 or 1
		 */
		slide: function ( direction ) {
			var highestPossibleFirstRev = this.revisions.getLength() - this.revisionsPerWindow;

			this.firstVisibleRevisionIndex += direction * this.revisionsPerWindow;
			this.firstVisibleRevisionIndex = Math.min( this.firstVisibleRevisionIndex, highestPossibleFirstRev );
			this.firstVisibleRevisionIndex = Math.max( 0, this.firstVisibleRevisionIndex );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Slider = Slider;
}( mediaWiki, jQuery ) );
