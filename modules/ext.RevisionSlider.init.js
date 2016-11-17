( function ( mw, $ ) {
	var settings = new mw.libs.revisionSlider.Settings(),
		autoExpand = settings.shouldAutoExpand(),
		expanded = autoExpand,
		initialized = false,
		autoExpandButton,
		/* eslint-disable dot-notation */
		/* jshint -W024 */
		toggleButton = OO.ui.ButtonWidget.static.infuse( $( '.mw-revslider-toggle-button' ) ),
		/* jshint +W024 */
		/* eslint-enable dot-notation */
		initialize = function () {
			var startTime = mw.now(),
				api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) );

			mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
			mw.libs.revisionSlider.userOffset = mw.user.options.values.timecorrection ? mw.user.options.values.timecorrection.split( '|' )[ 1 ] : mw.config.values.extRevisionSliderTimeOffset;

			mw.libs.revisionSlider.HelpDialog.init();

			api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
				startId: mw.config.values.extRevisionSliderNewRev,
				limit: mw.libs.revisionSlider.calculateRevisionsPerWindow( 160, 16 )
			} ).then( function ( data ) {
				var revs,
					revisionList,
					$container,
					slider;

				mw.track( 'timing.MediaWiki.RevisionSlider.timing.initFetchRevisionData', mw.now() - startTime );

				try {
					revs = data.revisions;
					revs.reverse();

					revisionList = new mw.libs.revisionSlider.RevisionList( mw.libs.revisionSlider.makeRevisions( revs ) );

					$container = $( '.mw-revslider-slider-wrapper' );
					slider = new mw.libs.revisionSlider.Slider( revisionList );
					slider.getView().render( $container );

					$( window ).on( 'resize', OO.ui.throttle( function () {
						slider.getView().render( $container );
					}, 250 ) );

					if ( !settings.shouldHideHelpDialogue() ) {
						mw.libs.revisionSlider.HelpDialog.show();
						settings.setHideHelpDialogue( true );
					}

					$( '.mw-revslider-placeholder' ).remove();
					mw.track( 'timing.MediaWiki.RevisionSlider.timing.init', mw.now() - startTime );
				} catch ( err ) {
					$( '.mw-revslider-placeholder' )
						.text( mw.message( 'revisionslider-loading-failed' ).text() );
					mw.log.error( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
				}

				initialized = true;
			}, function ( err ) {
				$( '.mw-revslider-placeholder' )
					.text( mw.message( 'revisionslider-loading-failed' ).text() );
				mw.log.error( err );
				mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
			} );
		},

		expandAndIntitialize = function () {
			$( '.mw-revslider-slider-wrapper' ).show();
			expanded = true;
			if ( !initialized ) {
				initialize();
			}
		};

	mw.track( 'counter.MediaWiki.RevisionSlider.event.load' );

	autoExpandButton = new OO.ui.ToggleButtonWidget( {
		icon: 'pin',
		classes: [ 'mw-revslider-auto-expand-button' ],
		title: mw.message( autoExpand ?
			'revisionslider-turn-off-auto-expand-title' :
			'revisionslider-turn-on-auto-expand-title'
		).text(),
		value: autoExpand
	} );

	autoExpandButton.connect( this, {
		click: function () {
			autoExpand = !autoExpand;
			settings.setAutoExpand( autoExpand );
			if ( autoExpand ) {
				autoExpandButton.setTitle( mw.message( 'revisionslider-turn-off-auto-expand-title' ).text() );
				expandAndIntitialize();
				toggleButton.setIcon( 'collapse' ).setTitle( mw.message( 'revisionslider-toggle-title-collapse' ).text() );
				mw.track( 'counter.MediaWiki.RevisionSlider.event.autoexpand_on' );
			} else {
				autoExpandButton.setTitle( mw.message( 'revisionslider-turn-on-auto-expand-title' ).text() );
				mw.track( 'counter.MediaWiki.RevisionSlider.event.autoexpand_off' );
			}
		}
	} );

	$( '.mw-revslider-container' ).append( autoExpandButton.$element );

	if ( autoExpand ) {
		expandAndIntitialize();
		toggleButton.setIcon( 'collapse' ).setTitle( mw.message( 'revisionslider-toggle-title-collapse' ).text() );
	}

	toggleButton.connect( this, {
		click: function () {
			expanded = !expanded;
			if ( expanded ) {
				expandAndIntitialize();
				toggleButton.setIcon( 'collapse' ).setTitle( mw.message( 'revisionslider-toggle-title-collapse' ).text() );
				mw.track( 'counter.MediaWiki.RevisionSlider.event.expand' );
				mw.hook( 'revslider.expand' ).fire();
			} else {
				$( '.mw-revslider-slider-wrapper' ).hide();
				toggleButton.setIcon( 'expand' ).setTitle( mw.message( 'revisionslider-toggle-title-expand' ).text() );
				mw.track( 'counter.MediaWiki.RevisionSlider.event.collapse' );
				mw.hook( 'revslider.collapse' ).fire();
			}
		}
	} );
}( mediaWiki, jQuery ) );
