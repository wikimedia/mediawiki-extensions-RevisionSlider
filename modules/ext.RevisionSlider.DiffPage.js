( function ( mw, $ ) {
	/**
	 * Module handling diff page reloading and the RevisionSlider browser history
	 *
	 * @constructor
	 */
	var DiffPage = function () {
		this.lastRequest = null;
	};

	$.extend( DiffPage.prototype, {
		/**
		 * Refreshes the diff view with two given revision IDs
		 *
		 * @param {number} revId1
		 * @param {number} revId2
		 * @param {number} [retryAttempt=0]
		 */
		refresh: function ( revId1, revId2, retryAttempt ) {
			var self = this,
				retryLimit = 2,
				data = {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				params = this.getExtraDiffPageParams();

			retryAttempt = retryAttempt || 0;

			if ( Object.keys( params ).length > 0 ) {
				$.extend( data, params );
			}

			if ( this.lastRequest ) {
				this.lastRequest.abort();
			}

			$( 'table.diff[data-mw="interface"]' ).addClass( 'mw-revslider-diff-loading' );

			this.lastRequest = $.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: data,
				tryCount: 0
			} );
			// Don't chain, so lastRequest is a jQuery.jqXHR object
			this.lastRequest.then( function ( data ) {
				var $data,
					$container = $( '.mw-revslider-container' ),
					$contentText = $( '#mw-content-text' ),
					$sidePanel = $( '#mw-panel' ),
					$navigation = $( '#p-views' ),
					$catLinks = $( '#catlinks' ),
					$printFooter =  $( '.printfooter' ),
					scrollLeft = $container.find( '.mw-revslider-revisions-container' ).scrollLeft();

				$data = $( data );
				$data.find( '.mw-revslider-container' ).replaceWith( $container );
				$navigation.replaceWith( $data.find( '#p-views' ) );
				$catLinks.replaceWith( $data.find( '#catlinks' ) );
				$sidePanel.replaceWith( $data.find( '#mw-panel' ) );
				$printFooter.replaceWith( $data.find( '.printfooter' ) );
				$contentText.html( $data.find( '#mw-content-text' ) )
					.find( '.mw-revslider-revisions-container' ).scrollLeft( scrollLeft );

				mw.hook( 'wikipage.content' ).fire( $contentText );
			}, function ( xhr ) {
				$( 'table.diff[data-mw="interface"]' ).removeClass( 'mw-revslider-diff-loading' );
				if ( xhr.statusText !== 'abort' ) {
					this.tryCount++;
					mw.track( 'counter.MediaWiki.RevisionSlider.error.refresh' );
					if ( retryAttempt <= retryLimit ) {
						console.log( 'Retrying request' );
						self.refresh( revId1, revId2, retryAttempt + 1 );
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
		 * @return {Object}
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
		 * @return {string}
		 */
		getStateUrl: function ( revId1, revId2 ) {
			var url = mw.util.wikiScript( 'index' ) + '?diff=' + Math.max( revId1, revId2 ) + '&oldid=' + Math.min( revId1, revId2 ),
				params = this.getExtraDiffPageParams();
			if ( Object.keys( params ).length > 0 ) {
				Object.keys( params ).forEach( function ( key ) {
					url += '&' + key + '=' + params[ key ];
				} );
			}
			return url;
		},

		/**
		 * Returns an object containing all possible parameters that should be included in diff URLs
		 * when selected revisions change, e.g. uselang
		 *
		 * @return {Object}
		 */
		getExtraDiffPageParams: function () {
			var params = {},
				paramArray = location.search.substr( 1 ).split( '&' ).filter( function ( elem ) {
					return elem.indexOf( '=' ) > 0 && elem.match( /^(diff|oldid)=/ ) === null;
				} );
			paramArray.forEach( function ( elem ) {
				var pair = elem.split( '=', 2 );
				params[ pair[ 0 ] ] = pair[ 1 ];
			} );
			return params;
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
