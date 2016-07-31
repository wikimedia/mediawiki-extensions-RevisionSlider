( function ( mw, $ ) {
	/**
	 * Module handling diff page reloading and the RevisionSlider browser history
	 *
	 * @constructor
	 */
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		/**
		 * Refreshes the diff view with two given revision IDs
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 */
		refresh: function ( revId1, revId2 ) {
			$( 'table.diff[data-mw="interface"]' )
				.append( $( '<tr>' ) )
				.append( $( '<td>' ) )
				.append( $( '<div>' ).attr( 'id', 'mw-revslider-darkness' ) );
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				tryCount: 0,
				retryLimit: 2,
				success: function ( data ) {
					var $container = $( '#mw-revslider-container' ),
						$contentText = $( '#mw-content-text' ),
						scrollLeft = $container.find( '.mw-revslider-revisions-container' ).scrollLeft();

					data = $( data );
					data.find( '#mw-revslider-container' )
						.replaceWith( $container );
					$contentText.html( data.find( '#mw-content-text' ) )
						.find( '.mw-revslider-revisions-container' ).scrollLeft( scrollLeft );

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

		/**
		 * Replaces the current state in the history stack
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 * @param {SliderView} sliderView
		 */
		replaceState: function ( revId1, revId2, sliderView ) {
			// IE8 and IE9 do not have history.pushState()
			if ( typeof history.replaceState === 'function' ) {
				history.replaceState(
					this.getStateObject( revId1, revId2, sliderView ),
					$( document ).find( 'title' ).text(),
					this.getStateUrl( revId1, revId2 )
				);
			}
		},

		/**
		 * Pushes the current state onto the history stack
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 * @param {SliderView} sliderView
		 */
		pushState: function ( revId1, revId2, sliderView ) {
			// IE8 and IE9 do not have history.pushState()
			if ( typeof history.pushState === 'function' ) {
				history.pushState(
					this.getStateObject( revId1, revId2, sliderView ),
					$( document ).find( 'title' ).text(),
					this.getStateUrl( revId1, revId2 )
				);
			}
		},

		/**
		 * Gets a state object to be used with history.replaceState and history.pushState
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 * @param {SliderView} sliderView
		 */
		getStateObject: function ( revId1, revId2, sliderView ) {
			return {
				revid1: revId1,
				revid2: revId2,
				pointerOlderPos: sliderView.pointerOlder.getPosition(),
				pointerNewerPos: sliderView.pointerNewer.getPosition(),
				sliderPos: sliderView.slider.getFirstVisibleRevisionIndex()
			};
		},

		/**
		 * Gets a URL to be used with history.replaceState and history.pushState
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 */
		getStateUrl: function ( revId1, revId2 ) {
			return mw.util.wikiScript( 'index' ) + '?diff=' + Math.max( revId1, revId2 ) + '&oldid=' + Math.min( revId1, revId2 );
		},

		/**
		 * @param {SliderView} sliderView
		 */
		initOnPopState: function ( sliderView ) {
			var self = this;
			window.addEventListener( 'popstate', function ( event ) {
				if ( event.state === null ) {
					return;
				}
				mw.track( 'counter.MediaWiki.RevisionSlider.event.historyChange' );
				sliderView.pointerOlder.setPosition( event.state.pointerOlderPos );
				sliderView.pointerNewer.setPosition( event.state.pointerNewerPos );
				sliderView.slider.setFirstVisibleRevisionIndex( event.state.sliderPos );
				sliderView.slide( 0 );
				sliderView.resetPointerStylesBasedOnPosition();
				sliderView.resetRevisionStylesBasedOnPointerPosition(
					sliderView.$element.find( 'div.mw-revslider-revisions' )
				);
				self.refresh( event.state.revid1, event.state.revid2 );
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.DiffPage = DiffPage;
}( mediaWiki, jQuery ) );
