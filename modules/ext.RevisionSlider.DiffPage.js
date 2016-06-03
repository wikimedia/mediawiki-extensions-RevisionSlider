( function ( mw, $ ) {
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		refresh: function ( revId1, revId2 ) {
			$( 'table.diff[data-mw="interface"]' )
				.append( $( '<tr>' ) )
				.append( $( '<td>' ) )
				.append( $( '<div>' ).attr( 'id', 'mw-revision-slider-darkness' ) );
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				tryCount: 0,
				retryLimit: 2,
				success: function ( data ) {
					var $container = $( '#mw-revision-slider-container' ),
						$contentText = $( '#mw-content-text' ),
						scrollLeft = $container.find( '.mw-revisions-container' ).scrollLeft();

					data = $( data );
					data.find( '#mw-revision-slider-container' )
						.replaceWith( $container );
					$contentText.html( data.find( '#mw-content-text' ) )
						.find( '.mw-revisions-container' ).scrollLeft( scrollLeft );

					mw.hook( 'wikipage.content' ).fire( $contentText );
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
			// IE8 and IE9 do not have history.pushState()
			if ( typeof history.pushState === 'function' ) {
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
			}
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
					sliderView.$element.find( 'div.mw-revisions' )
				);
				self.refresh( event.state.revid1, event.state.revid2 );
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.DiffPage = DiffPage;
}( mediaWiki, jQuery ) );
