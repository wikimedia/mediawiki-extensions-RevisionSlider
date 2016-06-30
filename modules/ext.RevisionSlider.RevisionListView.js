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
					rev.getUser() ?
						$( '<bdi>' ).append( $( '<p>' ).append(
							mw.message( 'revisionslider-label-username', mw.html.escape( rev.getUser() ) ).parseDom()
						) )
						: '',
					this.makeCommentLine( rev ),
					$( '<p>' ).append(
						mw.message( 'revisionslider-label-page-size', mw.language.convertNumber( rev.getSize() ), rev.getSize() ).parseDom()
					),
					this.makeChangeSizeLine( rev ),
					rev.isMinor() ? $( '<p>' ).text( mw.message( 'revisionslider-minoredit' ).text() ) : '' );

			return $tooltip.html();
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

		makeChangeSizeLine: function ( rev ) {
			var changeSizeClass = 'mw-no-change',
				leadingSign = '',
				$changeNumber;

			if ( rev.getRelativeSize() > 0 ) {
				changeSizeClass = 'mw-positive-change';
				leadingSign = '+';
			} else if ( rev.getRelativeSize() < 0 ) {
				changeSizeClass = 'mw-negative-change';
			}

			$changeNumber = $( '<span>' )
				.addClass( changeSizeClass )
				.text( leadingSign + mw.language.convertNumber( rev.getRelativeSize() ) );

			return $( '<p>' ).append(
				mw.message( 'revisionslider-label-change-size', $changeNumber, rev.getRelativeSize() ).parseDom()
			);
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionListView = RevisionListView;
}( mediaWiki, jQuery ) );
