( function ( mw, $ ) {
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		refresh: function ( revId1, revId2 ) {
			$( 'body' )
				.find( 'table.diff[data-mw=\'interface\']' )
				.append( '<div id="revision-slider-darkness"></div>' );
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				tryCount: 0,
				retryLimit: 2,
				success: function ( data ) {
					data = $( '<div/>' ).html( data ).contents();
					$( 'body' )
						.find( 'table.diff[data-mw=\'interface\']' )
						.html( data.find( 'table.diff[data-mw=\'interface\']' ) );
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
				{ revid1: revId1, revid2: revId2, leftPos: sliderView.leftPointer.getPosition(), rightPos: sliderView.rightPointer.getPosition(), sliderPos: sliderView.slider.getFirstVisibleRevisionIndex() },
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
				sliderView.leftPointer.setPosition( event.state.leftPos );
				sliderView.rightPointer.setPosition( event.state.rightPos );
				sliderView.slider.setFirstVisibleRevisionIndex( event.state.sliderPos );
				sliderView.slide( 0 );
				self.refresh( event.state.revid1, event.state.revid2 );
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.DiffPage = DiffPage;
}( mediaWiki, jQuery ) );
