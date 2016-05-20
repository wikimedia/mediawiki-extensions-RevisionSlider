( function ( mw, $ ) {
	/*global moment:false */
	var Revision = function ( data ) {
		this.id = data.revid;
		this.size = data.size;
		this.comment = data.comment;
		this.parsedComment = data.parsedcomment;
		this.timestamp = data.timestamp;
		this.user = data.user;
		this.minor = data.hasOwnProperty( 'minor' ) && ( data.minor || data.minor === '' );
	};

	$.extend( Revision.prototype, {
		/**
		 * @type {int}
		 */
		id: 0,

		/**
		 * @type {int}
		 */
		size: 0,

		/**
		 * @type {string}
		 */
		comment: '',

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
		 * @type {int}
		 */
		relativeSize: 0,

		getId: function () {
			return this.id;
		},

		getSize: function () {
			return this.size;
		},

		isMinor: function () {
			return this.minor;
		},

		getParsedComment: function () {
			return this.parsedComment;
		},

		hasEmptyComment: function () {
			return this.getComment().trim().length === 0;
		},

		getComment: function () {
			return this.comment;
		},

		formatDate: function ( rawDate ) {
			// Moment's offset works "backwards", as the number of minutes
			// behind UTC, so we need to make this number negative
			var offset = -mw.libs.revisionSlider.userOffset;
			return moment( rawDate ).zone( offset ).format( 'HH:mm, D MMM YYYY' );
		},

		getFormattedDate: function () {
			return this.formatDate( this.timestamp );
		},

		getUser: function () {
			return this.user;
		},

		setRelativeSize: function ( size ) {
			this.relativeSize = size;
		},

		getRelativeSize: function () {
			return this.relativeSize;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Revision = Revision;
}( mediaWiki, jQuery ) );
