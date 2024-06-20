const Revision = require( './ext.RevisionSlider.Revision.js' ).Revision,
	RevisionListView = require( './ext.RevisionSlider.RevisionListView.js' );

/**
 * @class RevisionList
 * @param {Revision[]} [revs=[]]
 * @param {Object[]} [availableTags=[]]
 * @constructor
 */
function RevisionList( revs, availableTags ) {
	// Make sure RevisionList instances don't accidentally share the same Array object
	this.revisions = [];
	this.availableTags = availableTags || [];
	this.push( revs || [] );
	this.view = new RevisionListView( this );
}

Object.assign( RevisionList.prototype, {
	/**
	 * @type {Revision[]}
	 */
	revisions: null,

	/**
	 * @type {Object[]}
	 */
	availableTags: null,

	/**
	 * @type {RevisionListView}
	 */
	view: null,

	/**
	 * @return {number}
	 */
	getBiggestChangeSize: function () {
		return Math.max( ...this.revisions.map( ( rev ) => Math.abs( rev.getRelativeSize() ) ) );
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

	/**
	 * @return {Object.<string,string>}
	 */
	getUserGenders: function () {
		const userGenders = {};
		this.revisions.forEach( ( revision ) => {
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
		const last = this.revisions[ this.revisions.length - 1 ];
		let sizeBefore = last ? last.getSize() : 0;
		for ( let i = 0; i < revs.length; i++ ) {
			const rev = revs[ i ];
			rev.setRelativeSize( rev.getSize() - sizeBefore );
			this.revisions.push( rev );
			sizeBefore = rev.getSize();
		}
	},

	/**
	 * Adds revisions to the beginning of the list.
	 *
	 * @param {Revision[]} revs
	 * @param {number} sizeBefore optional size of the revision preceding the first of revs, defaults to 0
	 */
	unshift: function ( revs, sizeBefore ) {
		const originalFirstRev = this.revisions[ 0 ];
		sizeBefore = sizeBefore || 0;

		originalFirstRev.setRelativeSize( originalFirstRev.getSize() - revs[ revs.length - 1 ].getSize() );
		for ( let i = revs.length - 1; i >= 0; i-- ) {
			const rev = revs[ i ];
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
		const slicedList = new RevisionList( [], this.getAvailableTags() );
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
 * @param {Object[]} revs
 * @return {Revision[]}
 */
function makeRevisions( revs ) {
	return revs.map( ( data ) => new Revision( data ) );
}

module.exports = {
	RevisionList: RevisionList,
	makeRevisions: makeRevisions
};
