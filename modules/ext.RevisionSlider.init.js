( function ( mw, $ ) {

	mw.loader.using( [ 'jquery.ui.draggable', 'jquery.ui.tooltip', 'jquery.tipsy' ], function () {
		$( function () {
			mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
			mw.libs.revisionSlider.fetchRevisions( {
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

						revisionList = new mw.libs.revisionSlider.RevisionList( revs );
						$container = $( '#revision-slider-container' );
						slider = new mw.libs.revisionSlider.Slider( revisionList );
						slider.getView().render( $container );

						$( '#revision-slider-placeholder' ).remove();
					} catch ( err ) {
						$( '#revision-slider-placeholder' )
							.html( mw.message( 'revisionslider-loading-failed' ).text() );
						console.log( err );
						mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
					}

				},
				error: function ( err ) {
					$( '#revision-slider-placeholder' )
						.html( mw.message( 'revisionslider-loading-failed' ).text() );
					console.log( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
				}
			} );
		} );
	} );

}( mediaWiki, jQuery ) );
