( function ( mw, $ ) {
	var expanded = false,
		initialized = false,
		/*jshint -W024 */
		toggleButton = OO.ui.ButtonWidget.static.infuse( 'mw-revslider-slider-toggle' ),
		/*jshint +W024 */
		initialize = function () {
			var startTime = mw.now(),
				api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) );

			mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
			mw.libs.revisionSlider.userOffset = mw.user.options.values.timecorrection ? mw.user.options.values.timecorrection.split( '|' )[ 1 ] : mw.config.values.extRevisionSliderTimeOffset;

			api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
				startId: mw.config.values.extRevisionSliderNewRev,
				limit: mw.libs.revisionSlider.calculateRevisionsPerWindow( 160, 16 ),

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

						$container = $( '#mw-revslider-slider-wrapper' );
						slider = new mw.libs.revisionSlider.Slider( revisionList );
						slider.getView().render( $container );

						if ( !mw.user.options.get( 'userjs-revslider-hidehelp' ) ) {
							mw.libs.revisionSlider.HelpDialog.show();
							( new mw.Api() ).saveOption( 'userjs-revslider-hidehelp', true );
						}

						$( '#mw-revslider-placeholder' ).remove();
						mw.track( 'timing.MediaWiki.RevisionSlider.timing.init', mw.now() - startTime );
					} catch ( err ) {
						$( '#mw-revslider-placeholder' )
							.text( mw.message( 'revisionslider-loading-failed' ).text() );
						console.log( err );
						mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
					}

					initialized = true;
				},
				error: function ( err ) {
					$( '#mw-revslider-placeholder' )
						.text( mw.message( 'revisionslider-loading-failed' ).text() );
					console.log( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
				}
			} );
		};

	mw.track( 'counter.MediaWiki.RevisionSlider.event.load' );

	toggleButton.connect( this, {
		click: function () {
			expanded = !expanded;
			toggleButton.setIcon( expanded ? 'collapse' : 'expand' );
			$( '#mw-revslider-slider-wrapper' ).toggle();
			if ( expanded ) {
				mw.track( 'counter.MediaWiki.RevisionSlider.event.expand' );
			} else {
				mw.track( 'counter.MediaWiki.RevisionSlider.event.collapse' );
			}
			if ( initialized ) {
				return;
			}
			initialize();
		}
	} );
}( mediaWiki, jQuery ) );
