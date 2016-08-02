( function ( mw, $ ) {
	var startTime = mw.now(),
		api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) );

	mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
	mw.libs.revisionSlider.userOffset = mw.user.options.values.timecorrection ? mw.user.options.values.timecorrection.split( '|' )[ 1 ] : mw.config.values.extRevisionSliderTimeOffset;

	api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
		startId: mw.config.values.extRevisionSliderNewRev,
		limit: mw.libs.revisionSlider.calculateRevisionsPerWindow( 120, 16 ),

		success: function ( data ) {
			var revs,
				revisionList,
				$container,
				slider;

			mw.track( 'timing.MediaWiki.RevisionSlider.timing.initFetchRevisionData', mw.now() - startTime );

			try {
				revs = data.revisions;
				revs.reverse();

				revisionList = new mw.libs.revisionSlider.RevisionList( mw.libs.revisionSlider.makeRevisions( revs ) );

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
				mw.track( 'timing.MediaWiki.RevisionSlider.timing.init', mw.now() - startTime );
			} catch ( err ) {
				$( '#mw-revslider-placeholder' )
					.text( mw.message( 'revisionslider-loading-failed' ).text() );
				console.log( err );
				mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
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
