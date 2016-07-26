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
		 * Fetches up to 500 revisions at a time
		 *
		 * @param {Object} options - Options containing callbacks for `success` and `error` as well as fields for
		 * `pageName` and `startId`
		 */
		fetchRevisions: function ( options ) {
			$.ajax( {
				url: this.url,
				data: {
					action: 'query',
					prop: 'revisions',
					format: 'json',
					rvprop: 'ids|timestamp|user|comment|parsedcomment|size|flags',
					titles: options.pageName,
					formatversion: 2,
					rvstartid: options.startId,
					'continue': '',
					rvlimit: 500
				},
				success: options.success,
				error: options.error
			} );
		},

		/**
		 * Fetches gender data for up to 500 user names
		 *
		 * @param {Object} options - Options containing callbacks for `success` and `error` as well as list
		 * of user names in `users`
		 */
		fetchUserGenderData: function ( options ) {
			$.ajax( {
				url: this.url,
				data: {
					action: 'query',
					list: 'users',
					format: 'json',
					usprop: 'gender',
					ususers: options.users.join( '|' ),
					uslimit: 500
				},
				success: options.success,
				error: options.error
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.Api = Api;
}( mediaWiki, jQuery ) );
