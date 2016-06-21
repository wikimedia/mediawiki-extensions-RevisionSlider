( function ( mw, $ ) {
	/**
	 * @param {Revision[]} revs
	 * @constructor
	 */
	var RevisionList = function ( revs ) {
		this.revisions = [];
		this.initialize( revs );
		this.view = new mw.libs.revisionSlider.RevisionListView( this );
	};

	$.extend( RevisionList.prototype, {
		/**
		 * @type {Revision[]}
		 */
		revisions: [],

		/**
		 * @type {RevisionListView}
		 */
		view: null,

		/**
		 * Inititializes the RevisionList from a list of Revisions
		 *
		 * @param {Revision[]} revs
		 */
		initialize: function ( revs ) {
			var i, rev;

			for ( i = 0; i < revs.length; i++ ) {
				rev = new mw.libs.revisionSlider.Revision( revs[ i ] );
				rev.setRelativeSize( i > 0 ? revs[ i ].size - revs[ i - 1 ].size : revs[ i ].size );

				this.revisions.push( rev );
			}
		},

		/**
		 * @return {number}
		 */
		getBiggestChangeSize: function () {
			var max = 0,
				i;

			for ( i = 0; i < this.revisions.length; i++ ) {
				max = Math.max( max, Math.abs( this.revisions[ i ].getRelativeSize() ) );
			}

			return max;
		},

		/**
		 * @return {Revision[]}
		 */
		getRevisions: function () {
			return this.revisions;
		},

		/**
		 * @return {number}
		 */
		getLength: function () {
			return this.revisions.length;
		},

		/**
		 * @return {RevisionListView}
		 */
		getView: function () {
			return this.view;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionList = RevisionList;
}( mediaWiki, jQuery ) );
