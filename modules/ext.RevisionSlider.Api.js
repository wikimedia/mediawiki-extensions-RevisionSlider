/**
 * @class Api
 * @param {string} apiUrl
 * @constructor
 */
function Api( apiUrl ) {
	this.url = apiUrl;
}

Object.assign( Api.prototype, {
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
	 * @param {Object} options
	 * @param {string} [options.dir='older'] Sort direction
	 * @param {number} [options.limit=500] Result limit
	 * @param {number} [options.startId]
	 * @param {number} [options.endId]
	 * @param {Object.<string,string>} [options.knownUserGenders]
	 * @return {jQuery.promise}
	 */
	fetchRevisionData: function ( pageName, options ) {
		const deferred = $.Deferred(),
			self = this;
		let userXhr;

		options = options || {};

		const xhr = this.fetchRevisions( pageName, options )
			.done( ( data ) => {
				let revs = data.query.pages[ 0 ].revisions;
				const revContinue = data.continue,
					genderData = options.knownUserGenders || {},
					changeTags = options.changeTags;

				if ( !revs ) {
					return deferred.reject;
				}

				if ( changeTags && changeTags.length > 0 ) {
					revs = self.getRevisionsWithNewTags( revs, changeTags );
				}

				// No need to query any gender data if masculine, feminine, and neutral are all
				// the same anyway
				const unknown = mw.msg( 'revisionslider-label-username', 'unknown' );
				if ( mw.msg( 'revisionslider-label-username', 'male' ) === unknown &&
					mw.msg( 'revisionslider-label-username', 'female' ) === unknown
				) {
					return deferred.resolve( { revisions: revs, continue: revContinue } );
				}

				const userNames = self.getUniqueUserNamesWithUnknownGender( revs, genderData );

				userXhr = self.fetchUserGenderData( userNames )
					.done( ( data2 ) => {
						if ( typeof data2 === 'object' &&
							data2.query &&
							data2.query.users &&
							data2.query.users.length > 0
						) {
							Object.assign( genderData, self.getUserGenderData( data2.query.users, genderData ) );
						}

						revs.forEach( ( rev ) => {
							if ( rev.user in genderData ) {
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
	 * @param {Object} [options]
	 * @param {string} [options.dir='older'] Sort direction
	 * @param {number} [options.limit=500] Result limit
	 * @param {number} [options.startId]
	 * @param {number} [options.endId]
	 * @return {jQuery.jqXHR}
	 */
	fetchRevisions: function ( pageName, options ) {
		options = options || {};
		const data = {
			action: 'query',
			prop: 'revisions',
			format: 'json',
			rvprop: 'ids|timestamp|user|parsedcomment|size|flags|tags',
			titles: pageName,
			formatversion: 2,
			continue: '',
			rvlimit: 500,
			rvdir: options.dir || 'older'
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
	 * @param {Object.<string,string>} knownUserGenders
	 * @return {string[]}
	 */
	getUniqueUserNamesWithUnknownGender: function ( revs, knownUserGenders ) {
		const allUsers = revs.map( ( rev ) => !( 'anon' in rev ) && rev.user );
		return allUsers.filter( ( name, index ) =>
			// Anonymous users don't have a name
			 name && !( name in knownUserGenders ) &&
				// This filters duplicates by rejecting all but the first one
				allUsers.indexOf( name ) === index
		 );
	},

	/**
	 * @param {Object[]} users
	 * @return {Object.<string,string>}
	 */
	getUserGenderData: function ( users ) {
		const genderData = {};
		users.forEach( ( user ) => {
			if ( user.gender && user.gender !== 'unknown' ) {
				genderData[ user.name ] = user.gender;
			}
		} );
		return genderData;
	},

	/**
	 * @param {Object[]} revs
	 * @param {Object[]} changeTags
	 * @return {Object[]}
	 */
	getRevisionsWithNewTags: function ( revs, changeTags ) {
		revs.forEach( ( rev ) => {
			rev.tags = rev.tags.map( ( tag ) => {
				changeTags.some( ( changeTag ) => {
					if ( tag === changeTag.name ) {
						tag = changeTag.displayname;
						return true;
					}
					return false;
				} );
				return tag;
			} ).filter( ( tag ) =>
				// Remove hidden tags (tags with no displayname)
				 tag
			 );
		} );
		return revs;
	}
} );

module.exports = Api;
