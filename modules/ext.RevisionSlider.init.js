( function ( mw, $ ) {
	var api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) );

	/**
	 * @param {Array} data
	 * @return {Object}
	 */
	function getUserGenderData( data ) {
		var genderData = {},
			usersWithGender = data.filter( function ( item ) {
				return typeof item.gender !== 'undefined' && item.gender !== 'unknown';
			} );
		usersWithGender.forEach( function ( item ) {
			genderData[ item.name ] = item.gender;
		} );
		return genderData;
	}

	mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
	mw.libs.revisionSlider.userOffset = mw.user.options.values.timecorrection ? mw.user.options.values.timecorrection.split( '|' )[ 1 ] : mw.config.values.extRevisionSliderTimeOffset;

	api.fetchRevisions( {
		pageName: mw.config.get( 'wgPageName' ),
		startId: mw.config.get( 'wgCurRevisionId' ),

		success: function ( data ) {
			var revs,
				revisionList,
				$container,
				slider;

			try {
				revs = data.query.pages[ 0 ].revisions;
				if ( !revs ) {
					return;
				}
				revs.reverse();

				revisionList = new mw.libs.revisionSlider.RevisionList( mw.libs.revisionSlider.makeRevisions( revs ) );

				api.fetchUserGenderData( {
					users: revisionList.getUserNames(),
					success: function ( data ) {
						var users = data.query.users;

						if ( users ) {
							revisionList.setUserGenders( getUserGenderData( users ) );
						}

						$container = $( '#mw-revslider-container' );
						slider = new mw.libs.revisionSlider.Slider( revisionList );
						slider.getView().render( $container );

						if ( !mw.user.options.get( 'userjs-revslider-hidehelp' ) ) {
							mw.libs.revisionSlider.HelpDialog.show();
							( new mw.Api() ).saveOption( 'userjs-revslider-hidehelp', true );
						}

						$container.append(
							$( '<button>' )
								.click( function () {
									mw.libs.revisionSlider.HelpDialog.show();
								} )
								.text( mw.message( 'revisionslider-show-help' ).text() )
								.addClass( 'mw-revslider-show-help' )
								.tipsy( {
									gravity: $( 'body' ).hasClass( 'ltr' ) ? 'se' : 'sw',
									offset: 15,
									title: function () {
										return mw.msg( 'revisionslider-show-help-tooltip' );
									}
								} )
						);

						$( '#mw-revslider-placeholder' ).remove();
					},
					error: function ( err ) {
						$( '#mw-revslider-placeholder' )
							.text( mw.message( 'revisionslider-loading-failed' ).text() );
						console.log( err );
						mw.track( 'counter.MediaWiki.RevisionSlider.error.init.genders' );
					}
				} );
			} catch ( err ) {
				if ( err === 'RS-rev-out-of-range' ) {
					$( '#mw-revslider-placeholder' )
						.text( mw.message( 'revisionslider-loading-out-of-range' ).text() );
					console.log( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.outOfRange' );
				} else {
					$( '#mw-revslider-placeholder' )
						.text( mw.message( 'revisionslider-loading-failed' ).text() );
					console.log( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
				}
			}

		},
		error: function ( err ) {
			$( '#mw-revslider-placeholder' )
				.text( mw.message( 'revisionslider-loading-failed' ).text() );
			console.log( err );
			mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
		}
	} );
}( mediaWiki, jQuery ) );
