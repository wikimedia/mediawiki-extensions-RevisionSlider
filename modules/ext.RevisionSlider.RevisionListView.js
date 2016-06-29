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
		 * @return {jQuery}
		 */
		render: function ( revisionTickWidth ) {
			var $html = $( '<div>' ).addClass( 'mw-revisions' ),
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
				};

			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = diffSize !== 0 ? Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5 : 0;
				tooltip = this.makeTooltip( revs[ i ] );

				$html
					.append( $( '<div>' )
						.addClass( 'mw-revision-wrapper' )
						.attr( 'title', tooltip )
						.width( revisionTickWidth )
						.tipsy( {
							gravity: 's',
							html: true,
							trigger: 'manual',
							className: 'mw-revision-tooltip'
						} )
						.append( $( '<div>' )
							.addClass( 'mw-revision' )
							.attr( 'data-revid', revs[ i ].getId() )
							.attr( 'data-pos', i + 1 )
							.css( {
								height: relativeChangeSize + 'px',
								width: revisionTickWidth + 'px',
								top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
							} )
							.addClass( diffSize > 0 ? 'mw-revision-up' : 'mw-revision-down' )
							.append( $( '<div>' ).addClass( 'mw-revision-border-box' ) )
						)
						.mouseover( showTooltip )
						.mouseout( hideTooltip )
					);
			}

			this.keepTooltipsOnHover();

			return $html;
		},

		/**
		 * Hides the current tooltip immediately
		 */
		hideCurrentTooltip: function () {
			if ( this.tooltipTimeout !== -1 ) {
				window.clearTimeout( this.tooltipTimeout );
				this.currentTooltip.tipsy( 'hide' );
				this.currentTooltip.removeClass( 'mw-revision-wrapper-hovered' );
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
				$rev.removeClass( 'mw-revision-wrapper-hovered' );
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
			$rev.addClass( 'mw-revision-wrapper-hovered' );
			this.currentTooltip = $rev;
		},

		/**
		 * Sets event handlers on tooltips so they do not disappear when hovering over them
		 */
		keepTooltipsOnHover: function () {
			var self = this;

			$( document )
				.on( 'mouseover', '.mw-revision-tooltip', function () {
					window.clearTimeout( self.tooltipTimeout );
				} )
				.on( 'mouseout', '.mw-revision-tooltip', function () {
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
						mw.message( 'revisionslider-label-date', rev.getFormattedDate() ).parseDom()
					),
					this.makeUserLine( rev.getUser() ),
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
			return ( mw.util.isIPAddress( user, false ) ? 'Special:Contributions/' : 'User:' ) + mw.html.escape( user );
		},

		/**
		 * Generates the HTML for the user label
		 *
		 * @param {string} userString
		 * @return {string|jQuery}
		 */
		makeUserLine: function ( userString ) {
			if ( !userString ) {
				return '';
			}

			return $( '<bdi>' ).append( $( '<p>' ).append(
				mw.message( 'revisionslider-label-username', mw.html.escape( userString ), this.getUserPage( userString ) ).parseDom()
			) );
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

			return $( '<bdi>' ).append(
				$( '<p>' ).append(
					$( '<strong>' ).text( mw.message( 'revisionslider-label-comment' ).text() ),
					$( '<em>' ).append(
						rev.getParsedComment()
					)
				)
			);
		},

		/**
		 * Generates the HTML for the page size label
		 *
		 * @param {int} size
		 * @return {jQuery}
		 */
		makePageSizeLine: function ( size ) {
			return $( '<p>' ).append(
				mw.message( 'revisionslider-label-page-size', mw.language.convertNumber( size ), size ).parseDom()
			);
		},

		/**
		 * Generates the HTML for the change size label
		 *
		 * @param {int} relativeSize
		 * @return {jQuery}
		 */
		makeChangeSizeLine: function ( relativeSize ) {
			var changeSizeClass = 'mw-no-change',
				leadingSign = '',
				$changeNumber;

			if ( relativeSize > 0 ) {
				changeSizeClass = 'mw-positive-change';
				leadingSign = '+';
			} else if ( relativeSize < 0 ) {
				changeSizeClass = 'mw-negative-change';
			}

			$changeNumber = $( '<span>' )
				.addClass( changeSizeClass )
				.text( leadingSign + mw.language.convertNumber( relativeSize ) );

			return $( '<p>' ).append(
				mw.message( 'revisionslider-label-change-size', $changeNumber, relativeSize ).parseDom()
			);
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionListView = RevisionListView;
}( mediaWiki, jQuery ) );
