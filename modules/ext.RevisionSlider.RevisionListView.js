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
		revisionWidth: 16,

		/**
		 * @type {number}
		 */
		tooltipTimeout: -1,

		/**
		 * @type {OO.ui.PopupWidget}
		 */
		currentTooltip: null,

		/**
		 * @type {jQuery}
		 */
		$highlightedRevisionWrapper: null,

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
				i, diffSize, relativeChangeSize,
				showTooltip = function () {
					self.showTooltip( $( this ) );
				},
				hideTooltip = function () {
					self.hideTooltip( $( this ) );
				};

			positionOffset = positionOffset || 0;
			this.revisionWidth = revisionTickWidth;

			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = diffSize !== 0 ? Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5 : 0;

				$html
					.append( $( '<div>' )
						.addClass( 'mw-revslider-revision-wrapper' )
						.width( this.revisionWidth )
						.append( $( '<div>' )
							.addClass( 'mw-revslider-revision' )
							.attr( 'data-revid', revs[ i ].getId() )
							.attr( 'data-pos', positionOffset + i + 1 )
							.css( {
								height: relativeChangeSize + 'px',
								width: this.revisionWidth + 'px',
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
			if ( this.tooltipTimeout !== -1 && this.$highlightedRevisionWrapper !== null ) {
				window.clearTimeout( this.tooltipTimeout );
				this.$highlightedRevisionWrapper.removeClass( 'mw-revslider-revision-wrapper-hovered' );
				this.currentTooltip.toggle( false );
				this.currentTooltip.$element.remove();
			}
		},

		/**
		 * Hides the tooltip after 500ms
		 *
		 * @param {jQuery} $rev
		 */
		hideTooltip: function ( $rev ) {
			var self = this;
			this.tooltipTimeout = window.setTimeout( function () {
				if ( $rev !== null ) {
					$rev.removeClass( 'mw-revslider-revision-wrapper-hovered' );
				}
				if ( self.currentTooltip !== null && self.currentTooltip.isVisible() ) {
					self.currentTooltip.toggle( false );
					self.currentTooltip.$element.remove();
				}
			}, 500 );
		},

		/**
		 * Hides the previous tooltip and shows the new one
		 *
		 * @param {jQuery} $rev
		 */
		showTooltip: function ( $rev ) {
			var pos = parseInt( $rev.find( '.mw-revslider-revision' ).attr( 'data-pos' ), 10 ),
				revId = parseInt( $rev.find( '.mw-revslider-revision' ).attr( 'data-revid' ), 10 ),
				revision =  this.getRevisionWithId( revId ),
				tooltip;
			if ( revision === null ) {
				return;
			}
			tooltip = this.makeTooltip( revision );
			tooltip.$element.css( {
				left: $rev.offset().left + this.revisionWidth / 2 + 'px',
				top: $rev.offset().top + $rev.outerHeight() + 'px'
			} );
			tooltip.$element.attr( 'id', 'mw-revslider-revision-tooltip-' + pos );
			$( 'body' ).append( tooltip.$element );
			tooltip.toggle( true );

			this.hideCurrentTooltip();
			$rev.addClass( 'mw-revslider-revision-wrapper-hovered' );
			this.$highlightedRevisionWrapper = $rev;
			this.currentTooltip = tooltip;
		},

		/**
		 * @param {number} revId
		 * @return {Revision|null}
		 */
		getRevisionWithId: function ( revId ) {
			var matchedRevision = null;
			this.revisionList.revisions.forEach( function ( revision ) {
				if ( revision.getId() === revId ) {
					matchedRevision = revision;
				}
			} );
			return matchedRevision;
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
					self.hideTooltip( self.$highlightedRevisionWrapper );
				} );
		},

		/**
		 * Generates the HTML for a tooltip that appears on hover above each revision on the slider
		 *
		 * @param {Revision} rev
		 * @return {OO.ui.PopupWidget}
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
			return new OO.ui.PopupWidget( {
				$content: $tooltip,
				padded: true,
				classes: [ 'mw-revslider-tooltip', 'mw-revslider-revision-tooltip' ]
			} );
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
