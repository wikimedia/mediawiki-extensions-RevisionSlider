( function ( mw, $ ) {
	/**
	 * @param {RevisionList} revisionList
	 * @constructor
	 */
	var RevisionListView = function ( revisionList ) {
		this.revisionList = revisionList;
	};

	$.extend( RevisionListView.prototype, {
		/**
		 * @type {RevisionList}
		 */
		revisionList: null,

		/**
		 * @type {number}
		 */
		tooltipTimeout: -1,

		/**
		 * @type {jQuery}
		 */
		currentTooltip: null,

		/**
		 * @param {number} revisionTickWidth
		 * @param {number} positionOffset
		 * @return {jQuery}
		 */
		render: function ( revisionTickWidth, positionOffset ) {
			var $html = $( '<div>' ).addClass( 'mw-revslider-revisions' ),
				revs = this.revisionList.getRevisions(),
				maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() ),
				self = this,
				i, diffSize, tooltip, relativeChangeSize,
				showTooltip = function () {
					self.showTooltip( $( this ) );
					$( this ).tipsy( 'show' );
				},
				hideTooltip = function () {
					self.hideTooltip( $( this ) );
				},
				tooltipGravity = function () {
					// Returns a function setting a gravity of the tooltip so that it will be entirely visible
					// Based on tipsy's own $.fn.tipsy.autoBounds, with considering the width of the
					// inner contents of the tooltip, and assuming the gravity always starts with 'n'
					return function () {
						var dir = 'n',
							$this = $( this ),
							$tip = $this.tipsy( true ).$tip,
							boundLeft = $( document ).scrollLeft() + $tip.outerWidth();

						if ( $this.offset().left < boundLeft ) {
							dir += 'w';
						}
						if ( $( window ).width() + $( document ).scrollLeft() - $this.offset().left < 0 ) {
							dir += 'e';
						}

						return dir;
					};
				};

			positionOffset = positionOffset || 0;

			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = diffSize !== 0 ? Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5 : 0;
				tooltip = this.makeTooltip( revs[ i ] );

				$html
					.append( $( '<div>' )
						.addClass( 'mw-revslider-revision-wrapper' )
						.attr( 'title', tooltip )
						.width( revisionTickWidth )
						.tipsy( {
							gravity: tooltipGravity(),
							html: true,
							trigger: 'manual',
							className: 'mw-revslider-revision-tooltip mw-revslider-revision-tooltip-' + ( i + 1 )
						} )
						.append( $( '<div>' )
							.addClass( 'mw-revslider-revision' )
							.attr( 'data-revid', revs[ i ].getId() )
							.attr( 'data-pos', positionOffset + i + 1 )
							.css( {
								height: relativeChangeSize + 'px',
								width: revisionTickWidth + 'px',
								top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
							} )
							.addClass( diffSize > 0 ? 'mw-revslider-revision-up' : 'mw-revslider-revision-down' )
							.append( $( '<div>' ).addClass( 'mw-revslider-revision-border-box' ) )
						)
						.mouseover( showTooltip )
						.mouseout( hideTooltip )
					);
			}

			this.keepTooltipsOnHover();

			return $html;
		},

		/**
		 * @param {jQuery} $renderedList
		 */
		adjustRevisionSizes: function ( $renderedList ) {
			var revs = this.revisionList.getRevisions(),
				maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() ),
				i, diffSize, relativeChangeSize;
			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = diffSize !== 0 ? Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5 : 0;
				$renderedList.find( '.mw-revslider-revision[data-pos="' + ( i + 1 ) + '"]' ).css( {
					height: relativeChangeSize + 'px',
					top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
				} );
			}
		},

		/**
		 * Hides the current tooltip immediately
		 */
		hideCurrentTooltip: function () {
			if ( this.tooltipTimeout !== -1 ) {
				window.clearTimeout( this.tooltipTimeout );
				this.currentTooltip.tipsy( 'hide' );
				this.currentTooltip.removeClass( 'mw-revslider-revision-wrapper-hovered' );
			}
		},

		/**
		 * Hides the tooltip after 500ms
		 *
		 * @param {jQuery} $rev
		 */
		hideTooltip: function ( $rev ) {
			this.tooltipTimeout = window.setTimeout( function () {
				$rev.tipsy( 'hide' );
				$rev.removeClass( 'mw-revslider-revision-wrapper-hovered' );
			}, 500 );
		},

		/**
		 * Hides the previous tooltip and shows the new one
		 *
		 * @param {jQuery} $rev
		 */
		showTooltip: function ( $rev ) {
			this.hideCurrentTooltip();
			$rev.tipsy( 'show' );
			$rev.addClass( 'mw-revslider-revision-wrapper-hovered' );
			this.currentTooltip = $rev;
		},

		/**
		 * Sets event handlers on tooltips so they do not disappear when hovering over them
		 */
		keepTooltipsOnHover: function () {
			var self = this;

			$( document )
				.on( 'mouseover', '.mw-revslider-revision-tooltip', function () {
					window.clearTimeout( self.tooltipTimeout );
				} )
				.on( 'mouseout', '.mw-revslider-revision-tooltip', function () {
					self.hideTooltip( self.currentTooltip );
				} );
		},

		/**
		 * Generates the HTML for a tooltip that appears on hover above each revision on the slider
		 *
		 * @param {Revision} rev
		 * @return {string}
		 */
		makeTooltip: function ( rev ) {
			var $tooltip = $( '<div>' )
				.append(
					$( '<p>' ).append(
						$( '<strong>' ).text( mw.msg( 'revisionslider-label-date' ) + mw.msg( 'colon-separator' ) ),
						rev.getFormattedDate()
					),
					this.makeUserLine( rev.getUser(), rev.getUserGender() ),
					this.makeCommentLine( rev ),
					this.makePageSizeLine( rev.getSize() ),
					this.makeChangeSizeLine( rev.getRelativeSize() ),
					rev.isMinor() ? $( '<p>' ).text( mw.message( 'revisionslider-minoredit' ).text() ) : ''
				);
			return $tooltip.html();
		},

		/**
		 * Generates a link to user page or to contributions page for IP addresses
		 *
		 * @param {string} user
		 * @return {string}
		 */
		getUserPage: function ( user ) {
			return ( mw.util.isIPAddress( user, false ) ? 'Special:Contributions/' : 'User:' ) + this.stripInvalidCharacters( user );
		},

		/**
		 * Generates the HTML for the user label
		 *
		 * @param {string} userString
		 * @param {string} userGender
		 * @return {string|jQuery}
		 */
		makeUserLine: function ( userString, userGender ) {
			if ( !userString ) {
				return '';
			}

			if ( !userGender ) {
				userGender = 'unknown';
			}
			return $( '<p>' ).append(
				$( '<strong>' ).text( mw.msg( 'revisionslider-label-username', userGender ) + mw.msg( 'colon-separator' ) ),
				$( '<bdi>' ).append(
					$( '<a>' ).addClass( 'mw-userlink' ).attr( 'href', mw.util.getUrl( this.getUserPage( userString ) ) ).text( this.stripInvalidCharacters( userString ) )
				)
			);
		},

		/**
		 * @param {string} s
		 * @return {string}
		 */
		stripInvalidCharacters: function ( s ) {
			return s.replace( /[<>&]/g, '' );
		},

		/**
		 * Generates the HTML for the comment label
		 *
		 * @param {Revision} rev
		 * @return {string|jQuery}
		 */
		makeCommentLine: function ( rev ) {
			if ( rev.hasEmptyComment() ) {
				return '';
			}

			return $( '<p>' ).append(
				$( '<strong>' ).text( mw.msg( 'revisionslider-label-comment' ) + mw.msg( 'colon-separator' ) ),
				$( '<em>' ).append(
					$( '<bdi>' ).append(
						rev.getParsedComment()
					)
				)
			);
		},

		/**
		 * Generates the HTML for the page size label
		 *
		 * @param {number} size
		 * @return {jQuery}
		 */
		makePageSizeLine: function ( size ) {
			return $( '<p>' ).append(
				$( '<strong>' ).text( mw.msg( 'revisionslider-label-page-size' ) + mw.msg( 'colon-separator' ) ),
				mw.msg( 'revisionslider-page-size', mw.language.convertNumber( size ), size )
			);
		},

		/**
		 * Generates the HTML for the change size label
		 *
		 * @param {number} relativeSize
		 * @return {jQuery}
		 */
		makeChangeSizeLine: function ( relativeSize ) {
			var changeSizeClass = 'mw-revslider-change-none',
				leadingSign = '',
				$changeNumber;

			if ( relativeSize > 0 ) {
				changeSizeClass = 'mw-revslider-change-positive';
				leadingSign = '+';
			} else if ( relativeSize < 0 ) {
				changeSizeClass = 'mw-revslider-change-negative';
			}

			$changeNumber = $( '<span>' )
				.addClass( changeSizeClass )
				.attr( {
					dir: 'ltr' // Make sure that minus/plus is on the left
				} )
				.text( leadingSign + mw.language.convertNumber( relativeSize ) );

			return $( '<p>' ).append(
				$( '<strong>' ).text( mw.msg( 'revisionslider-label-change-size' ) + mw.msg( 'colon-separator' ) ),
				mw.message( 'revisionslider-change-size', $changeNumber, relativeSize, Math.abs( relativeSize ) ).parse()
			);
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionListView = RevisionListView;
}( mediaWiki, jQuery ) );
