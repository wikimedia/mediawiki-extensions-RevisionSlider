( function ( mw, $ ) {
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

		initialize: function ( revs ) {
			var i;

			for ( i = 0; i < revs.length; i++ ) {
				this.revisions.push( new mw.libs.revisionSlider.Revision( revs[ i ] ) );
			}
		},

		getBiggestChangeSize: function () {
			var max = 0,
				changeSize, i;

			for ( i = 1; i < this.revisions.length; i++ ) {
				changeSize = Math.abs( this.revisions[ i ].getSize() - this.revisions[ i - 1 ].getSize() );
				max = Math.max( max, changeSize );
			}

			return max;
		},

		getRevisions: function () {
			return this.revisions;
		},

		getLength: function () {
			return this.revisions.length;
		},

		getView: function () {
			return this.view;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionList = RevisionList;
}( mediaWiki, jQuery ) );
