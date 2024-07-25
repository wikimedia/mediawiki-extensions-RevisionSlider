/**
 * Module handling diff page reloading and the RevisionSlider browser history
 *
 * @class Diffpage
 * @param {History} [historyObj] Defaults to the global History object
 * @constructor
 */
function DiffPage( historyObj ) {
	this.lastRequest = null;

	this.history = historyObj || history;
}

Object.assign( DiffPage.prototype, {
	/**
	 * Refreshes the diff view with two given revision IDs
	 *
	 * @param {number} diff
	 * @param {number} oldid
	 * @param {SliderView} sliderView
	 * @param {number} [retryAttempt=0]
	 */
	refresh: function ( diff, oldid, sliderView, retryAttempt ) {
		const self = this,
			retryLimit = 2,
			data = {
				diff: diff,
				oldid: oldid
			},
			params = this.getExtraDiffPageParams();

		retryAttempt = retryAttempt || 0;

		if ( Object.keys( params ).length > 0 ) {
			Object.assign( data, params );
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
		this.lastRequest.then( ( data2 ) => {
			const $data = $( data2 ),
				$container = $( '.mw-revslider-container' ),
				scrollLeft = $container.find( '.mw-revslider-revisions-container' ).scrollLeft();

			// Add our current rendered slider into the newly loaded container
			$data.find( '.mw-revslider-container' ).replaceWith( $container );
			const $contentText = $data.find( '#mw-content-text' );

			// Replace elements on the page with the newly loaded elements, from top to bottom
			$( '#mw-content-text' ).replaceWith( $contentText );
			$( '.printfooter' ).replaceWith( $data.find( '.printfooter' ) );

			const $catlinks = $data.find( '.catlinks[data-mw="interface"]' );
			mw.hook( 'wikipage.categories' ).fire( $catlinks );
			$( '.catlinks[data-mw="interface"]' ).replaceWith( $catlinks );

			// Replace navigation menus. See also T211557
			[ '#t-permalink', '#ca-delete', '#ca-edit', '#footer-places-mobileview' ].forEach( ( selector ) => {
				$( selector ).parent().replaceWith( $data.find( selector ).parent() );
			} );

			// Update wgRevisionId (T161257), and wgDiffOldId/NewId
			mw.config.set( {
				wgRevisionId: diff,
				wgDiffOldId: oldid,
				wgDiffNewId: diff
			} );

			$( '.mw-revslider-revisions-container' ).scrollLeft( scrollLeft );

			self.addHandlersToCoreLinks( sliderView );

			// Re-trigger existing, stable core hooks under the same circumstances as in core
			mw.hook( 'wikipage.content' ).fire( $contentText );

			const $nodes = $( 'table.diff[data-mw="interface"]' );
			if ( $nodes.length ) {
				mw.hook( 'wikipage.diff' ).fire( $nodes.eq( 0 ) );
			}
		}, function ( xhr ) {
			$( 'table.diff[data-mw="interface"]' ).removeClass( 'mw-revslider-diff-loading' );
			if ( xhr.statusText !== 'abort' ) {
				this.tryCount++;
				mw.track( 'counter.MediaWiki.RevisionSlider.error.refresh' );
				if ( retryAttempt <= retryLimit ) {
					self.refresh( diff, oldid, sliderView, retryAttempt + 1 );
				}
				// TODO notify the user that we failed to update the diff?
				// This could also attempt to reload the page with the correct diff loaded without ajax?
			}
		} );
	},

	/**
	 * Replaces the current state in the history stack
	 *
	 * @param {number} diff
	 * @param {number} oldid
	 * @param {SliderView} sliderView
	 */
	replaceState: function ( diff, oldid, sliderView ) {
		this.history.replaceState(
			this.getStateObject( diff, oldid, sliderView ),
			$( document ).find( 'title' ).text(),
			this.getStateUrl( diff, oldid )
		);
	},

	/**
	 * Pushes the current state onto the history stack
	 *
	 * @param {number} diff
	 * @param {number} oldid
	 * @param {SliderView} sliderView
	 */
	pushState: function ( diff, oldid, sliderView ) {
		this.history.pushState(
			this.getStateObject( diff, oldid, sliderView ),
			$( document ).find( 'title' ).text(),
			this.getStateUrl( diff, oldid )
		);
	},

	/**
	 * Gets a state object to be used with history.replaceState and history.pushState
	 *
	 * @private
	 * @param {number} diff
	 * @param {number} oldid
	 * @param {SliderView} sliderView
	 * @return {Object}
	 */
	getStateObject: function ( diff, oldid, sliderView ) {
		return {
			diff: diff,
			oldid: oldid,
			pointerOlderPos: sliderView.pointerOlder.getPosition(),
			pointerNewerPos: sliderView.pointerNewer.getPosition(),
			sliderPos: sliderView.slider.getOldestVisibleRevisionIndex()
		};
	},

	/**
	 * Gets a URL to be used with history.replaceState and history.pushState
	 *
	 * @private
	 * @param {number} diff
	 * @param {number} oldid
	 * @return {string}
	 */
	getStateUrl: function ( diff, oldid ) {
		let url = mw.util.wikiScript( 'index' ) + '?diff=' + diff + '&oldid=' + oldid;
		const params = this.getExtraDiffPageParams();
		for ( const key in params ) {
			url += '&' + key + '=' + params[ key ];
		}
		return url;
	},

	/**
	 * Returns an object containing all possible parameters that should be included in diff URLs
	 * when selected revisions change, e.g. uselang
	 *
	 * @private
	 * @return {Object}
	 */
	getExtraDiffPageParams: function () {
		const params = {},
			paramArray = location.search.slice( 1 ).split( '&' ).filter( ( elem ) => elem.indexOf( '=' ) > 0 && elem.match( /^(diff|oldid)=/ ) === null );
		paramArray.forEach( ( elem ) => {
			const pair = elem.split( '=', 2 );
			params[ pair[ 0 ] ] = pair[ 1 ];
		} );
		return params;
	},

	/**
	 * @param {SliderView} sliderView
	 */
	initOnPopState: function ( sliderView ) {
		window.addEventListener( 'popstate', ( event ) => {
			if ( event.state === null ) {
				return;
			}
			mw.track( 'counter.MediaWiki.RevisionSlider.event.historyChange' );
			sliderView.slider.setFirstVisibleRevisionIndex( event.state.sliderPos );
			sliderView.updatePointersAndDiffView(
				event.state.pointerNewerPos,
				event.state.pointerOlderPos,
				false
			);
		} );
	},

	/**
	 * @param {SliderView} sliderView
	 */
	addHandlersToCoreLinks: function ( sliderView ) {
		$( '#differences-nextlink' ).on( 'click', () => {
			sliderView.showNextDiff();
			return false;
		} );
		$( '#differences-prevlink' ).on( 'click', () => {
			sliderView.showPrevDiff();
			return false;
		} );
	}
} );

module.exports = DiffPage;
