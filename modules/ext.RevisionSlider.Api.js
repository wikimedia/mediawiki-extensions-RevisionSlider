( function ( mw, $ ) {
	/**
	 * @param {string} apiUrl
	 * @constructor
	 */
	var Api = function ( apiUrl ) {
		this.url = apiUrl;
	};

	$.extend( Api.prototype, {
		url: '',

		/**
		 * Fetches a batch of revision data, including a gender setting for users who edited the revision
		 *
		 * @param {string} pageName
		 * @param {Object} options - Options containing callbacks for `success` and `error` as well as
		 * optional fields for: `dir (defaults to `older`), `limit` (defaults to 500), `startId`, `endId`,
		 * `knownUserGenders`
		 */
		fetchRevisionData: function ( pageName, options ) {
			var self = this;
			this.fetchRevisions( pageName, options )
				.done( function ( data ) {
					var revs = data.query.pages[ 0 ].revisions,
						/*jshint -W024 */
						revContinue = data.continue,
						/*jshint +W024 */
						genderData = typeof options.knownUserGenders !== 'undefined' ? options.knownUserGenders : {},
						userNames;

					if ( !revs ) {
						return;
					}

					userNames = self.getUserNames( revs, genderData );

					self.fetchUserGenderData( userNames )
						.done( function ( data ) {
							var users = typeof data !== 'undefined' ? data.query.users : [];

							if ( users.length > 0 ) {
								$.extend( genderData, self.getUserGenderData( users, genderData ) );
							}

							revs.forEach( function ( rev ) {
								if ( typeof rev.user !== 'undefined' && typeof genderData[ rev.user ] !== 'undefined' ) {
									rev.userGender = genderData[ rev.user ];
								}
							} );

							options.success( { revisions: revs, 'continue': revContinue } );
						} )
						.fail( options.error );
				} )
				.fail( options.error );
		},

		/**
		 * Fetches up to 500 revisions at a time
		 *
		 * @param {string} pageName
		 * @param {Object} options object containing optional options, fields: `dir` (defaults to `older`),
		 * `limit` (defaults to 500), `startId`, `endId`
		 * @return {jQuery}
		 */
		fetchRevisions: function ( pageName, options ) {
			var dir = options.dir !== undefined ? options.dir : 'older',
				data = {
					action: 'query',
					prop: 'revisions',
					format: 'json',
					rvprop: 'ids|timestamp|user|comment|parsedcomment|size|flags',
					titles: pageName,
					formatversion: 2,
					'continue': '',
					rvlimit: 500,
					rvdir: dir
				};

			if ( options.startId !== undefined ) {
				data.rvstartid = options.startId;
			}
			if ( options.endId !== undefined ) {
				data.rvendid = options.endId;
			}
			if ( options.limit !== undefined && options.limit <= 500 ) {
				data.rvlimit = options.limit;
			}

			return $.ajax( {
				url: this.url,
				data: data
			} );
		},

		/**
		 * Fetches gender data for up to 500 user names
		 *
		 * @param {string[]} users
		 * @return {jQuery}
		 */
		fetchUserGenderData: function ( users ) {
			if ( users.length === 0 ) {
				return $.Deferred().resolve();
			}
			return $.ajax( {
				url: this.url,
				data: {
					action: 'query',
					list: 'users',
					format: 'json',
					usprop: 'gender',
					ususers: users.join( '|' ),
					uslimit: 500
				}
			} );
		},

		/**
		 * @param {Array} revs
		 * @param {Object} knownUserGenders
		 * @return {string[]}
		 */
		getUserNames: function ( revs, knownUserGenders ) {
			var allUsers = revs.map( function ( rev ) {
				return typeof rev.user !== 'undefined' ? rev.user : '';
			} );
			return allUsers.filter( function ( value, index, array ) {
				return value !== '' && typeof knownUserGenders[ value ] === 'undefined' && array.indexOf( value ) === index;
			} );
		},

		/**
		 * @param {Array} data
		 * @return {Object}
		 */
		getUserGenderData: function ( data ) {
			var genderData = {},
				usersWithGender = data.filter( function ( item ) {
					return typeof item.gender !== 'undefined' && item.gender !== 'unknown';
				} );
			usersWithGender.forEach( function ( item ) {
				genderData[ item.name ] = item.gender;
			} );
			return genderData;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Api = Api;
}( mediaWiki, jQuery ) );
