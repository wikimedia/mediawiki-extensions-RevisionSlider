( function ( mw, $ ) {
	var Slider = function ( revisions ) {
		this.revisions = revisions;
		this.view = new mw.libs.revisionSlider.SliderView( this );
	};

	$.extend( Slider.prototype, {
		/**
		 * @type {RevisionList}
		 */
		revisions: null,

		firstVisibleRevisionIndex: 0,

		revisionsPerWindow: 0,

		/**
		 * @type {SliderView}
		 */
		view: null,

		getRevisions: function () {
			return this.revisions;
		},

		getView: function () {
			return this.view;
		},

		setRevisionsPerWindow: function ( n ) {
			this.revisionsPerWindow = n;
		},

		getRevisionsPerWindow: function () {
			return this.revisionsPerWindow;
		},

		getFirstVisibleRevisionIndex: function () {
			return this.firstVisibleRevisionIndex;
		},

		slide: function ( direction ) {
			var highestPossibleFirstRev = this.revisions.getLength() - 1 - this.revisionsPerWindow;

			this.firstVisibleRevisionIndex += direction * this.revisionsPerWindow;
			this.firstVisibleRevisionIndex = Math.min( this.firstVisibleRevisionIndex, highestPossibleFirstRev );
			this.firstVisibleRevisionIndex = Math.max( 0, this.firstVisibleRevisionIndex );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Slider = Slider;
}( mediaWiki, jQuery ) );
