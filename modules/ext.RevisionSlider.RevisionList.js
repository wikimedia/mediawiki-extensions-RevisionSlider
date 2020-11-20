var Revision = require( './ext.RevisionSlider.Revision.js' ).Revision,
	RevisionListView = require( './ext.RevisionSlider.RevisionListView.js' );

/**
 * @class RevisionList
 * @param {Revision[]} revs
 * @param {Object[]} availableTags
 * @constructor
 */
function RevisionList( revs, availableTags ) {
	this.revisions = [];
	this.availableTags = availableTags;
	this.initialize( revs );
	this.view = new RevisionListView( this );
}

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
	 * Initializes the RevisionList from a list of Revisions
	 *
	 * @param {Revision[]} revs
	 */
	initialize: function ( revs ) {
		for ( var i = 0; i < revs.length; i++ ) {
			var rev = revs[ i ];
			rev.setRelativeSize( i > 0 ? rev.getSize() - revs[ i - 1 ].getSize() : rev.getSize() );

			this.revisions.push( rev );
		}
	},

	/**
	 * @return {number}
	 */
	getBiggestChangeSize: function () {
		var max = 0;

		for ( var i = 0; i < this.revisions.length; i++ ) {
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
	},

	/**
	 * @return {Object[]}
	 */
	getAvailableTags: function () {
		return this.availableTags;
	},

	getUserGenders: function () {
		var userGenders = {};
		this.revisions.forEach( function ( revision ) {
			if ( revision.getUser() ) {
				userGenders[ revision.getUser() ] = revision.getUserGender();
			}
		} );
		return userGenders;
	},

	/**
	 * Adds revisions to the end of the list.
	 *
	 * @param {Revision[]} revs
	 */
	push: function ( revs ) {
		for ( var i = 0; i < revs.length; i++ ) {
			var rev = revs[ i ];
			rev.setRelativeSize(
				i > 0 ?
					rev.getSize() - revs[ i - 1 ].getSize() :
					rev.getSize() - this.revisions[ this.revisions.length - 1 ].getSize()
			);

			this.revisions.push( rev );
		}
	},

	/**
	 * Adds revisions to the beginning of the list.
	 *
	 * @param {Revision[]} revs
	 * @param {number} sizeBefore optional size of the revision preceding the first of revs, defaults to 0
	 */
	unshift: function ( revs, sizeBefore ) {
		var originalFirstRev = this.revisions[ 0 ];
		sizeBefore = sizeBefore || 0;

		originalFirstRev.setRelativeSize( originalFirstRev.getSize() - revs[ revs.length - 1 ].getSize() );
		for ( var i = revs.length - 1; i >= 0; i-- ) {
			var rev = revs[ i ];
			rev.setRelativeSize( i > 0 ? rev.getSize() - revs[ i - 1 ].getSize() : rev.getSize() - sizeBefore );

			this.revisions.unshift( rev );
		}
	},

	/**
	 * Returns a subset of the list.
	 *
	 * @param {number} begin
	 * @param {number} end
	 * @return {RevisionList}
	 */
	slice: function ( begin, end ) {
		var slicedList = new RevisionList( [], this.getAvailableTags() );
		slicedList.view = new RevisionListView( slicedList );
		slicedList.revisions = this.revisions.slice( begin, end );
		return slicedList;
	},

	/**
	 * @param {number} pos
	 * @return {boolean}
	 */
	isValidPosition: function ( pos ) {
		return pos > 0 && pos <= this.getLength();
	}
} );

/**
 * Transforms an array of revision data returned by MediaWiki API (including user gender information) into
 * an array of Revision objects
 *
 * @param {Array} revs
 * @return {Revision[]}
 */
function makeRevisions( revs ) {
	return revs.map( function ( revData ) {
		return new Revision( revData );
	} );
}

module.exports = {
	RevisionList: RevisionList,
	makeRevisions: makeRevisions
};
