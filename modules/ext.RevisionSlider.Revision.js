let userOffset;

/* global moment:false */
/**
 * @class Revision
 * @param {Object} data - Containing keys `id`, `size`, `parsedcomment`, `timestamp`, `user` and `minor`
 * @constructor
 */
function Revision( data ) {
	this.id = data.revid;
	this.size = data.size;
	this.timestamp = data.timestamp;
	this.minor = !!data.minor || data.minor === '';

	// Comments, tags, and users can be suppressed thus we must check if they exist
	this.parsedComment = data.parsedcomment || '';
	this.tags = data.tags || [];
	this.user = data.user || '';
	this.userGender = data.userGender || '';
}

Object.assign( Revision.prototype, {
	/**
	 * @type {number}
	 */
	id: 0,

	/**
	 * @type {number}
	 */
	size: 0,

	/**
	 * @type {string[]}
	 */
	tags: null,

	/**
	 * @type {boolean}
	 */
	minor: false,

	/**
	 * @type {string}
	 */
	parsedComment: '',

	/**
	 * @type {string}
	 */
	timestamp: '',

	/**
	 * @type {string}
	 */
	user: '',

	/**
	 * @type {string}
	 */
	userGender: '',

	/**
	 * @type {number} Warning, only set for Revision objects that are part of a RevisionList
	 */
	relativeSize: 0,

	/**
	 * @return {number}
	 */
	getId: function () {
		return this.id;
	},

	/**
	 * @return {number}
	 */
	getSize: function () {
		return this.size;
	},

	/**
	 * @return {boolean}
	 */
	isMinor: function () {
		return this.minor;
	},

	/**
	 * @return {string}
	 */
	getParsedComment: function () {
		return this.parsedComment;
	},

	/**
	 * @return {string[]}
	 */
	getTags: function () {
		return this.tags;
	},

	/**
	 * Uses moment.js to format the date
	 *
	 * @return {string}
	 */
	getFormattedDate: function () {
		const offset = parseInt( userOffset );
		return moment( this.timestamp ).utcOffset( offset ).format( 'LLL' );
	},

	/**
	 * @return {string}
	 */
	getUser: function () {
		return this.user;
	},

	/**
	 * @return {string}
	 */
	getUserGender: function () {
		return this.userGender;
	},

	/**
	 * @param {number} size
	 */
	setRelativeSize: function ( size ) {
		this.relativeSize = size;
	},

	/**
	 * @return {number}
	 */
	getRelativeSize: function () {
		return this.relativeSize;
	}
} );

module.exports = {
	Revision: Revision,
	setUserOffset: function ( offset ) {
		userOffset = offset;
	}
};
