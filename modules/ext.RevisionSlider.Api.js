( function () {
	/**
	 * @param {string} apiUrl
	 * @constructor
	 */
	var Api = function ( apiUrl ) {
		this.url = apiUrl;
	};

	/**
	 * @class mw.libs.revisionSlider.Api
	 */
	$.extend( Api.prototype, {
		url: '',

		/**
		 * Fetches change tags
		 *
		 * @return {jQuery.jqXHR}
		 */

		fetchAvailableChangeTags: function () {
			return $.ajax( {
				url: this.url,
				data: {
					action: 'query',
					list: 'tags',
					tgprop: 'displayname',
					tglimit: 500,
					format: 'json'
				}
			} );
		},

		/**
		 * Fetches a batch of revision data, including a gender setting for users who edited the revision
		 *
		 * @param {string} pageName
		 * @param {Object} options Options
		 * @param {string} [options.dir='older'] Sort direction
		 * @param {number} [options.limit=500] Result limit
		 * @param {number} [options.startId] Start ID
		 * @param {number} [options.endId] End ID
		 * @param {Object} [options.knownUserGenders] Known user genders
		 * @return {jQuery.promise}
		 */
		fetchRevisionData: function ( pageName, options ) {
			var xhr, userXhr,
				deferred = $.Deferred(),
				self = this;

			options = options || {};

			xhr = this.fetchRevisions( pageName, options )
				.done( function ( data ) {
					var revs = data.query.pages[ 0 ].revisions,
						revContinue = data.continue,
						genderData = options.knownUserGenders || {},
						changeTags = options.changeTags || [],
						unknown,
						userNames;

					if ( !revs ) {
						return deferred.reject;
					}

					if ( changeTags && changeTags.length > 0 ) {
						revs = self.getRevisionsWithNewTags( revs, changeTags );
					}

					// No need to query any gender data if masculine, feminine, and neutral are all
					// the same anyway
					unknown = mw.msg( 'revisionslider-label-username', 'unknown' );
					if ( mw.msg( 'revisionslider-label-username', 'male' ) === unknown &&
						mw.msg( 'revisionslider-label-username', 'female' ) === unknown
					) {
						return deferred.resolve( { revisions: revs, continue: revContinue } );
					}

					userNames = self.getUniqueUserNamesWithUnknownGender( revs, genderData );

					userXhr = self.fetchUserGenderData( userNames )
						.done( function ( data ) {
							if ( typeof data === 'object' &&
								data.query &&
								data.query.users &&
								data.query.users.length > 0
							) {
								$.extend( genderData, self.getUserGenderData( data.query.users, genderData ) );
							}

							revs.forEach( function ( rev ) {
								if ( 'user' in rev && rev.user in genderData ) {
									rev.userGender = genderData[ rev.user ];
								}
							} );

							deferred.resolve( { revisions: revs, continue: revContinue } );
						} )
						.fail( deferred.reject );
				} )
				.fail( deferred.reject );

			return deferred.promise( {
				abort: function () {
					xhr.abort();
					if ( userXhr ) {
						userXhr.abort();
					}
				}
			} );
		},

		/**
		 * Fetches up to 500 revisions at a time
		 *
		 * @param {string} pageName
		 * @param {Object} [options] Options
		 * @param {string} [options.dir='older'] Sort direction
		 * @param {number} [options.limit=500] Result limit
		 * @param {number} [options.startId] Start ID
		 * @param {number} [options.endId] End ID
		 * @return {jQuery.jqXHR}
		 */
		fetchRevisions: function ( pageName, options ) {
			var dir, data;

			options = options || {};
			dir = 'dir' in options ? options.dir : 'older';
			data = {
				action: 'query',
				prop: 'revisions',
				format: 'json',
				rvprop: 'ids|timestamp|user|comment|parsedcomment|size|flags|tags',
				titles: pageName,
				formatversion: 2,
				continue: '',
				rvlimit: 500,
				rvdir: dir
			};

			if ( 'startId' in options ) {
				data.rvstartid = options.startId;
			}
			if ( 'endId' in options ) {
				data.rvendid = options.endId;
			}
			if ( 'limit' in options && options.limit <= 500 ) {
				data.rvlimit = options.limit;
			}

			return $.ajax( {
				url: this.url,
				data: data
			} );
		},

		/**
		 * Fetches gender data for maximum 50 user names
		 *
		 * @param {string[]} users
		 * @return {jQuery.jqXHR}
		 */
		fetchUserGenderData: function ( users ) {
			if ( users.length === 0 ) {
				return $.Deferred().resolve();
			}
			return $.ajax( {
				url: this.url,
				data: {
					formatversion: 2,
					action: 'query',
					list: 'users',
					format: 'json',
					usprop: 'gender',
					ususers: users.slice( 0, 50 ).join( '|' )
				}
			} );
		},

		/**
		 * @param {Object[]} revs
		 * @param {Object} knownUserGenders
		 * @return {string[]}
		 */
		getUniqueUserNamesWithUnknownGender: function ( revs, knownUserGenders ) {
			var allUsers = revs.map( function ( rev ) {
				return 'user' in rev && !( 'anon' in rev ) ? rev.user : '';
			} );
			return allUsers.filter( function ( value, index, array ) {
				return value !== '' && !( value in knownUserGenders ) && array.indexOf( value ) === index;
			} );
		},

		/**
		 * @param {Object[]} data
		 * @return {Object}
		 */
		getUserGenderData: function ( data ) {
			var genderData = {},
				usersWithGender = data.filter( function ( item ) {
					return 'gender' in item && item.gender !== 'unknown';
				} );
			usersWithGender.forEach( function ( item ) {
				genderData[ item.name ] = item.gender;
			} );
			return genderData;
		},

		/**
		 * @param {Object[]} revs
		 * @param {Object[]} changeTags
		 * @return {Object[]}
		 */
		getRevisionsWithNewTags: function ( revs, changeTags ) {
			revs.forEach( function ( rev ) {
				var oldTags = rev.tags,
					newTags = [];

				if ( oldTags.length > 0 ) {
					oldTags.forEach( function ( tag ) {
						changeTags.forEach( function ( changeTag ) {
							if ( changeTag.name === tag ) {
								tag = changeTag.displayname;
							}
						} );
						// Remove hidden tags (tags with no displayname)
						if ( tag ) {
							newTags.push( tag );
						}
					} );
					rev.tags = newTags;
				}
			} );
			return revs;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Api = Api;
}() );
