( function ( mw, $ ) {

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

		getComment: function () {
			return this.comment;
		},

		getSection: function () {
			var comment = this.getComment();
			comment = comment.match(
				new RegExp( '(/\\* [^\\*]* \\*/)', 'gi' )
			);
			if ( !comment ) {
				return '';
			}
			return comment[ 0 ].replace(
				new RegExp( ' \\*/|/\\* ', 'gi' ),
				''
			);
		},

		formatDate: function ( rawDate ) {
			var MONTHS = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ],
				offset = mw.user.options.values.timecorrection ? mw.user.options.values.timecorrection.split( '|' )[ 1 ] : mw.config.values.extRevisionSliderTimeOffset,
				f = new Date( ( new Date( rawDate ) ).getTime() + ( offset * 60 * 1000 ) ),
				fDate = f.getUTCDate(),
				fMonth = f.getUTCMonth(),
				fYear = f.getUTCFullYear(),
				fHours = ( '0' + f.getUTCHours() ).slice( -2 ),
				fMinutes = ( '0' + f.getUTCMinutes() ).slice( -2 );

			return fHours + ':' + fMinutes + ', ' + fDate + ' ' + MONTHS[ fMonth ] + ' ' + fYear;
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
