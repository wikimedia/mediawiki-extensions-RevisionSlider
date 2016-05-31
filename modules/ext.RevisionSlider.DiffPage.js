( function ( mw, $ ) {
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		refresh: function ( revId1, revId2 ) {
			$( 'table.diff[data-mw=\'interface\']' )
				.append( '<tr><td><div id="revision-slider-darkness"></div></td></tr>' );
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				tryCount: 0,
				retryLimit: 2,
				success: function ( data ) {
					var $container = $( '#revision-slider-container' ),
						scrollLeft = $container.find( '.revisions-container' ).scrollLeft();

					data = $( data );
					data.find( '#revision-slider-container' )
						.replaceWith( $container );
					$( '#mw-content-text' ).html( data.find( '#mw-content-text' ) )
						.find( '.revisions-container' ).scrollLeft( scrollLeft );
				},
				error: function ( err ) {
					this.tryCount++;
					console.log( err );
					mw.track( 'counter.MediaWiki.RevisionSlider.error.refresh' );
					if ( this.tryCount <= this.retryLimit ) {
						console.log( 'Retrying request' );
						$.ajax( this );
					}
					// TODO notify the user that we failed to update the diff?
					// This could also attempt to reload the page with the correct diff loaded without ajax?
				}
			} );
		},

		pushState: function ( revId1, revId2, sliderView ) {
			history.pushState(
				{
					revid1: revId1,
					revid2: revId2,
					leftPos: sliderView.pointerOne.getPosition(),
					rightPos: sliderView.pointerTwo.getPosition(),
					sliderPos: sliderView.slider.getFirstVisibleRevisionIndex()
				},
				$( document ).find( 'title' ).text(),
				mw.util.wikiScript( 'index' ) + '?diff=' + Math.max( revId1, revId2 ) + '&oldid=' + Math.min( revId1, revId2 )
			);
		},

		initOnPopState: function ( sliderView ) {
			var self = this;
			window.addEventListener( 'popstate', function ( event ) {
				if ( event.state === null ) {
					return;
				}
				mw.track( 'counter.MediaWiki.RevisionSlider.event.historyChange' );
				sliderView.pointerOne.setPosition( event.state.leftPos );
				sliderView.pointerTwo.setPosition( event.state.rightPos );
				sliderView.slider.setFirstVisibleRevisionIndex( event.state.sliderPos );
				sliderView.slide( 0 );
				sliderView.resetPointerStylesBasedOnPosition();
				sliderView.resetRevisionStylesBasedOnPointerPosition(
					sliderView.$element.find( 'div.revisions' )
				);
				self.refresh( event.state.revid1, event.state.revid2 );
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.DiffPage = DiffPage;
}( mediaWiki, jQuery ) );
