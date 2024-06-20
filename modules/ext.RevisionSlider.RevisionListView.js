/**
 * @class RevisionListView
 * @param {RevisionList} revisionList
 * @constructor
 */
function RevisionListView( revisionList ) {
	this.revisionList = revisionList;
}

Object.assign( RevisionListView.prototype, {
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
	minRevisionHeight: 5,

	/**
	 * @type {number}
	 */
	maxRevisionHeight: 66,

	/**
	 * @type {number}
	 */
	tooltipTimeout: -1,

	/**
	 * @type {boolean}
	 */
	allowRevisionPreviewHighlights: true,

	/**
	 * @type {string}
	 */
	selectedUser: '',

	/**
	 * @type {string}
	 */
	selectedTag: '',

	/**
	 * @type {jQuery}
	 */
	html: null,

	/**
	 * @param {number} revisionTickWidth
	 * @param {number} [positionOffset=0]
	 * @return {jQuery}
	 */
	render: function ( revisionTickWidth, positionOffset ) {
		const revs = this.revisionList.getRevisions();
		const maxChangeSize = this.revisionList.getBiggestChangeSize();
		const self = this;

		positionOffset = positionOffset || 0;
		this.revisionWidth = revisionTickWidth;

		this.$html = $( '<div>' ).addClass( 'mw-revslider-revisions' );

		for ( let i = 0; i < revs.length; i++ ) {
			const diffSize = revs[ i ].getRelativeSize();
			const relativeChangeSize = this.calcRelativeChangeSize( diffSize, maxChangeSize );

			this.$html
				.append( $( '<div>' )
					.addClass( 'mw-revslider-revision-wrapper' )
					.width( this.revisionWidth )
					.append( $( '<div>' )
						.addClass( 'mw-revslider-revision' )
						.attr( 'data-revid', revs[ i ].getId() )
						.attr( 'data-pos', positionOffset + i + 1 )
						.attr( 'data-user', revs[ i ].getUser() )
						.css( {
							height: relativeChangeSize + 'px',
							width: this.revisionWidth + 'px',
							top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
						} )
						.addClass( diffSize > 0 ? 'mw-revslider-revision-up' : 'mw-revslider-revision-down' )
						.append( $( '<div>' ).addClass( 'mw-revslider-revision-border-box' ) )
					)
					.append( $( '<div>' )
						.addClass( 'mw-revslider-revision-wrapper-up' )
						.width( this.revisionWidth )
						.append(
							$( '<div>' )
								.addClass( 'mw-revslider-pointer mw-revslider-pointer-ghost' )
						)
					)
					.append( $( '<div>' )
						.addClass( 'mw-revslider-revision-wrapper-down' )
						.width( this.revisionWidth )
						.append(
							$( '<div>' )
								.addClass( 'mw-revslider-pointer mw-revslider-pointer-ghost' )
						)
					)
					.on( 'mouseenter', function ( event ) {
						self.onRevisionHover( $( this ), event );
					} )
					.on( 'mouseleave', () => {
						self.removeAllRevisionPreviewHighlights();
						self.removeCurrentRevisionFocusWithDelay();
					} )
				);
		}

		this.closeTooltipsOnClick();

		return this.$html;
	},

	/**
	 * @param {boolean} [enabled=true]
	 */
	enableRevisionPreviewHighlights: function ( enabled ) {
		this.allowRevisionPreviewHighlights = enabled !== false;
		if ( !this.allowRevisionPreviewHighlights ) {
			this.removeAllRevisionPreviewHighlights();
		}
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 * @param {MouseEvent} event
	 */
	onRevisionHover: function ( $revisionWrapper, event ) {
		if ( !this.allowRevisionPreviewHighlights ||
			$( event.target ).closest( '.mw-revslider-revision-tooltip' ).length
		) {
			return;
		}

		this.setRevisionFocus( $revisionWrapper );

		const hasMovedTop = event.pageY - $revisionWrapper.offset().top < $revisionWrapper.height() / 2,
			isOlderTop = $revisionWrapper.hasClass( 'mw-revslider-revision-older' ) && hasMovedTop,
			isNewerBottom = $revisionWrapper.hasClass( 'mw-revslider-revision-newer' ) && !hasMovedTop;
		let $neighborRevisionWrapper = $revisionWrapper;

		if ( isOlderTop ) {
			$neighborRevisionWrapper = $revisionWrapper.prev();
		} else if ( isNewerBottom ) {
			$neighborRevisionWrapper = $revisionWrapper.next();
		}

		if ( $neighborRevisionWrapper.length === 0 ) {
			return;
		}

		if ( hasMovedTop ) {
			this.setRevisionPreviewHighlight( $revisionWrapper.find( '.mw-revslider-revision-wrapper-up' ) );
			if ( isOlderTop ) {
				this.setRevisionPreviewHighlight( $neighborRevisionWrapper.find( '.mw-revslider-revision-wrapper-down' ) );
			}
		} else {
			this.setRevisionPreviewHighlight( $revisionWrapper.find( '.mw-revslider-revision-wrapper-down' ) );
			if ( isNewerBottom ) {
				this.setRevisionPreviewHighlight( $neighborRevisionWrapper.find( '.mw-revslider-revision-wrapper-up' ) );
			}
		}
	},

	/**
	 * @private
	 * @param {jQuery} $revisionWrapper
	 */
	setRevisionPreviewHighlight: function ( $revisionWrapper ) {
		$revisionWrapper.addClass( 'mw-revslider-revision-hovered' );
	},

	removeAllRevisionPreviewHighlights: function () {
		$( '.mw-revslider-revision-wrapper-up, .mw-revslider-revision-wrapper-down' )
			.removeClass( 'mw-revslider-revision-hovered' );
	},

	/**
	 * @param {jQuery} $renderedList
	 */
	adjustRevisionSizes: function ( $renderedList ) {
		const revs = this.revisionList.getRevisions();
		const maxChangeSize = this.revisionList.getBiggestChangeSize();

		for ( let i = 0; i < revs.length; i++ ) {
			const diffSize = revs[ i ].getRelativeSize();
			const relativeChangeSize = this.calcRelativeChangeSize( diffSize, maxChangeSize );

			$renderedList.find( '.mw-revslider-revision[data-pos="' + ( i + 1 ) + '"]' ).css( {
				height: relativeChangeSize + 'px',
				top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
			} );
		}
	},

	/**
	 * @private
	 * @param {number} diffSize
	 * @param {number} maxChangeSize
	 * @return {number}
	 */
	calcRelativeChangeSize: function ( diffSize, maxChangeSize ) {
		if ( !diffSize ) {
			return 0;
		}
		return Math.ceil(
			( this.maxRevisionHeight - this.minRevisionHeight ) *
				Math.log( Math.abs( diffSize ) ) / Math.log( maxChangeSize ) ) +
			this.minRevisionHeight;
	},

	/**
	 * Clears the current revision focus and removes highlights and tooltip
	 */
	removeCurrentRevisionFocus: function () {
		this.clearRevisionFocusDelay();
		this.removeCurrentRevisionFocusHighlight();
		$( '.mw-revslider-revision-tooltip' ).remove();
	},

	/**
	 * Removes the current revision focus after 750ms
	 *
	 * @private
	 */
	removeCurrentRevisionFocusWithDelay: function () {
		this.tooltipTimeout = window.setTimeout( this.removeCurrentRevisionFocus.bind( this ), 750 );
	},

	/**
	 * @private
	 */
	clearRevisionFocusDelay: function () {
		window.clearTimeout( this.tooltipTimeout );
	},

	removeCurrentRevisionFocusHighlight: function () {
		$( '.mw-revslider-revision-wrapper-hovered' )
			.removeClass( 'mw-revslider-revision-wrapper-hovered' );
	},

	/**
	 * Sets the revision focus adding highlights and tooltip
	 *
	 * @param {jQuery} $revisionWrapper
	 */
	setRevisionFocus: function ( $revisionWrapper ) {
		if ( $revisionWrapper.hasClass( 'mw-revslider-revision-wrapper-hovered' ) ) {
			this.clearRevisionFocusDelay();
			return;
		}
		this.removeCurrentRevisionFocus();

		this.showTooltip( $revisionWrapper );
		$revisionWrapper.addClass( 'mw-revslider-revision-wrapper-hovered' );
	},

	/**
	 * Hides the current tooltip when the focus moves away and not to a pointer or tooltip
	 *
	 * @param {jQuery.Event} event
	 */
	onFocusBlur: function ( event ) {
		const $outElement = $( event.relatedTarget );
		if ( $outElement.hasClass( '.mw-revslider-pointer' ) || $outElement.closest( '.mw-revslider-revision-tooltip' ).length ) {
			return;
		}
		this.removeCurrentRevisionFocus();
	},

	/**
	 * Hides the previous tooltip and shows the new one. Also styles a revision as hovered.
	 *
	 * @param {jQuery} $revisionWrapper
	 */
	showTooltip: function ( $revisionWrapper ) {
		const $revision = $revisionWrapper.find( '.mw-revslider-revision' );
		const revId = +$revision.attr( 'data-revid' );
		const pos = +$revision.attr( 'data-pos' );

		const revision = this.revisionList.getRevisions().find( ( rev ) => rev.getId() === revId );
		const tooltip = this.makeTooltip( revision, $revisionWrapper );

		// eslint-disable-next-line mediawiki/class-doc
		tooltip.$element
			.addClass( 'mw-revslider-revision-tooltip-' + pos )
			.on( 'focusout', this.onFocusBlur.bind( this ) )
			// Set event handlers so that tooltips do not disappear immediately when hover is gone
			.on( 'mouseleave', this.removeCurrentRevisionFocusWithDelay.bind( this ) )
			.on( 'mouseenter', this.clearRevisionFocusDelay.bind( this ) );

		const $focusedRevisionPointer = $( '.mw-revslider-pointer[data-pos="' + pos + '"]' );
		if ( $focusedRevisionPointer.length ) {
			// Make sure tooltips are added next to the pointer so they can be reached when tabbing
			$focusedRevisionPointer.parent().append( tooltip.$element );
		} else {
			$( document.body ).append( tooltip.$element );
		}

		tooltip.toggle( true );
	},

	/**
	 * Sets an event handler to close tooltips when clicking somewhere outside
	 *
	 * @private
	 */
	closeTooltipsOnClick: function () {
		const self = this;

		$( document )
			.on( 'click', ( event ) => {
				const $inside = $( event.target )
					.closest( '.mw-revslider-revision-tooltip, .mw-revslider-revisions-container' );
				if ( !$inside.length ) {
					self.removeCurrentRevisionFocus();
				}
			} );
	},

	/**
	 * Generates the HTML for a tooltip that appears on hover above each revision on the slider
	 *
	 * @private
	 * @param {Revision} revision
	 * @param {jQuery} $revisionWrapper
	 * @return {OO.ui.PopupWidget}
	 */
	makeTooltip: function ( revision, $revisionWrapper ) {
		const $tooltip = $( '<div>' )
			.append(
				$( '<p>' ).append(
					$( '<strong>' ).text( mw.msg( 'revisionslider-label-date' ) + mw.msg( 'colon-separator' ) ),
					$( '<a>' ).attr( 'href', mw.util.getUrl( null, { oldid: revision.id } ) )
						.text( revision.getFormattedDate() )
				),
				this.makeUserLine( revision.getUser(), revision.getUserGender() ),
				this.makeCommentLine( revision ),
				this.makePageSizeLine( revision.getSize() ),
				this.makeChangeSizeLine( revision.getRelativeSize() ),
				revision.isMinor() ? $( '<p>' ).text( mw.msg( 'revisionslider-minoredit' ) ) : '',
				this.makeTagsLine( revision )
			);
		return new OO.ui.PopupWidget( {
			$content: $tooltip,
			$floatableContainer: $revisionWrapper,
			padded: true,
			classes: [ 'mw-revslider-tooltip', 'mw-revslider-revision-tooltip' ]
		} );
	},

	/**
	 * Generates a link to user page or to contributions page for IP addresses
	 *
	 * @private
	 * @param {string} user
	 * @return {string}
	 */
	getUserPage: function ( user ) {
		return ( mw.util.isIPAddress( user ) ? 'Special:Contributions/' : 'User:' ) + this.stripInvalidCharacters( user );
	},

	/**
	 * Generates the HTML for the user label
	 *
	 * @private
	 * @param {string} userString
	 * @param {string} [userGender='unknown']
	 * @return {string|jQuery}
	 */
	makeUserLine: function ( userString, userGender ) {
		const self = this;

		if ( !userString ) {
			return '';
		}
		if ( !userGender ) {
			userGender = 'unknown';
		}

		const $userBubble = $( '<div>' ).addClass( 'mw-revslider-bubble' )
			.on( 'click mouseenter mouseleave', function ( event ) {
				self.setUserFilterEvents( $( this ), userString, event );
			} );
		const $userLine = $( '<p>' ).addClass( 'mw-revslider-filter-highlightable-row mw-revslider-username-row' ).append(
			$( '<strong>' ).text( mw.msg( 'revisionslider-label-username', userGender ) + mw.msg( 'colon-separator' ) ),
			$( '<bdi>' ).append(
				$( '<a>' ).addClass( 'mw-userlink' ).attr( 'href', mw.util.getUrl( this.getUserPage( userString ) ) ).text( this.stripInvalidCharacters( userString ) )
			),
			$userBubble
		);

		if ( self.selectedUser === userString ) {
			self.selectedTag = '';
			$userLine.addClass( 'mw-revslider-filter-highlight' );
			$userBubble.addClass( 'mw-revslider-filter-highlight-bubble' );
		}

		return $userLine;
	},

	/**
	 * Set user filter events for revisions
	 *
	 * @private
	 * @param {jQuery} $userBubble
	 * @param {string} userName
	 * @param {MouseEvent} event
	 */
	setUserFilterEvents: function ( $userBubble, userName, event ) {
		const $userLine = $userBubble.parent();

		if ( this.selectedUser === userName && event.type !== 'click' ) {
			return;
		}

		this.removeRevisionFilterHighlighting();

		let oldUser;
		switch ( event.type ) {
			case 'mouseenter':
				$userLine.addClass( 'mw-revslider-filter-highlight' );
				$userBubble.addClass( 'mw-revslider-filter-highlight-bubble' );
				this.filterHighlightSameUserRevisions( userName );
				break;
			case 'mouseleave':
				this.reApplySavedFilterHighlighting( $userLine, $userBubble );
				break;
			case 'click':
				oldUser = this.selectedUser;
				this.resetRevisionFilterHighlighting();

				$userLine.addClass( 'mw-revslider-filter-highlight' );
				$userBubble.addClass( 'mw-revslider-filter-highlight-bubble' );

				if ( oldUser !== userName ) {
					this.filterHighlightSameUserRevisions( userName );
					this.selectedUser = userName;
				}
				break;
		}
	},

	/**
	 * Highlights revisions of the sameUser
	 *
	 * @private
	 * @param {string} userString
	 */
	filterHighlightSameUserRevisions: function ( userString ) {
		$( '[data-user="' + userString + '"]' ).parent()
			.toggleClass( 'mw-revslider-revision-filter-highlight' );
	},

	/**
	 * @private
	 * @param {string} s
	 * @return {string}
	 */
	stripInvalidCharacters: function ( s ) {
		return s.replace( /[<>&]/g, '' );
	},

	/**
	 * Generates the HTML for the comment label
	 *
	 * @private
	 * @param {Revision} rev
	 * @return {string|jQuery}
	 */
	makeCommentLine: function ( rev ) {
		const html = rev.getParsedComment();
		if ( !html.trim().length ) {
			return '';
		}

		return $( '<p>' ).append(
			$( '<strong>' ).text( mw.msg( 'revisionslider-label-comment' ) + mw.msg( 'colon-separator' ) ),
			$( '<em>' ).append(
				$( '<bdi>' ).append( html )
			)
		);
	},

	/**
	 * Generates the HTML for the tags label
	 *
	 * @private
	 * @param {Revision} rev
	 * @return {string|jQuery}
	 */
	makeTagsLine: function ( rev ) {
		const self = this;

		const tags = rev.getTags();
		if ( !tags.length ) {
			return '';
		}

		const $tagLines = $( '<div>' );

		for ( let i = 0; i < tags.length; i++ ) {
			const $tagBubble = $( '<div>' ).addClass( 'mw-revslider-bubble' )
				.on( 'click mouseenter mouseleave', function ( event ) {
					self.setTagFilterEvents( $( this ), event );
				} );
			const $tagLine = $( '<div>' ).addClass( 'mw-revslider-filter-highlightable-row mw-revslider-tag-row' ).append(
				tags[ i ],
				$tagBubble,
				'<br>'
			);

			if ( self.selectedTag === tags[ i ] ) {
				self.selectedUser = '';
				$tagLine.addClass( 'mw-revslider-filter-highlight' );
				$tagLine.find( $tagBubble ).addClass( 'mw-revslider-filter-highlight-bubble' );
			}

			$tagLine.attr( 'data-tag-name', tags[ i ] );
			$tagLines.append( $tagLine );
		}

		return $tagLines;
	},

	/**
	 * Set tag filter events for revisions
	 *
	 * @private
	 * @param {jQuery} $tagBubble
	 * @param {MouseEvent} event
	 */
	setTagFilterEvents: function ( $tagBubble, event ) {
		const $tagLine = $tagBubble.parent(),
			tagName = $tagLine.attr( 'data-tag-name' );

		if ( this.selectedTag === tagName && event.type !== 'click' ) {
			return;
		}

		this.removeRevisionFilterHighlighting();

		let oldTag;
		switch ( event.type ) {
			case 'mouseenter':
				$tagLine.addClass( 'mw-revslider-filter-highlight' );
				$tagBubble.addClass( 'mw-revslider-filter-highlight-bubble' );
				this.filterHighlightSameTagRevisions( tagName );
				break;
			case 'mouseleave':
				this.reApplySavedFilterHighlighting( $tagLine, $tagBubble );
				break;
			case 'click':
				oldTag = this.selectedTag;
				this.resetRevisionFilterHighlighting();

				$tagLine.addClass( 'mw-revslider-filter-highlight' );
				$tagBubble.addClass( 'mw-revslider-filter-highlight-bubble' );

				if ( oldTag !== tagName ) {
					this.filterHighlightSameTagRevisions( tagName );
					this.selectedTag = tagName;
				}
				break;
		}
	},

	/**
	 * Highlight same tag revisions
	 *
	 * @private
	 * @param {string} tagName
	 */
	filterHighlightSameTagRevisions: function ( tagName ) {
		const revs = this.revisionList.getRevisions();

		for ( let i = 0; i < revs.length; i++ ) {
			if ( revs[ i ].getTags().indexOf( tagName ) !== -1 ) {
				$( '[data-revid="' + revs[ i ].id + '"]' ).parent()
					.addClass( 'mw-revslider-revision-filter-highlight' );
			}
		}
	},

	/**
	 * Re-apply filter highlighting from saved state
	 *
	 * @private
	 * @param {jQuery} $line
	 * @param {jQuery} $bubble
	 */
	reApplySavedFilterHighlighting: function ( $line, $bubble ) {
		$line.removeClass( 'mw-revslider-filter-highlight' );
		$bubble.removeClass( 'mw-revslider-filter-highlight-bubble' );
		if ( this.selectedTag ) {
			this.filterHighlightSameTagRevisions( this.selectedTag );
		}
		if ( this.selectedUser ) {
			this.filterHighlightSameUserRevisions( this.selectedUser );
		}
	},

	/**
	 * Removes the filter highlighting from the revisions
	 *
	 * @private
	 */
	removeRevisionFilterHighlighting: function () {
		$( '.mw-revslider-revision-wrapper' ).removeClass( 'mw-revslider-revision-filter-highlight' );
	},

	/**
	 * Resets filter highlighting from setting state
	 *
	 * @private
	 */
	resetRevisionFilterHighlighting: function () {
		$( '.mw-revslider-filter-highlightable-row' ).removeClass( 'mw-revslider-filter-highlight' );
		$( '.mw-revslider-bubble' ).removeClass( 'mw-revslider-filter-highlight-bubble' );
		this.selectedTag = '';
		this.selectedUser = '';
	},

	/**
	 * Generates the HTML for the page size label
	 *
	 * @private
	 * @param {number} size
	 * @return {jQuery}
	 */
	makePageSizeLine: function ( size ) {
		return $( '<p>' )
			.text( mw.msg( 'revisionslider-page-size', mw.language.convertNumber( size ), size ) )
			.prepend( $( '<strong>' ).text( mw.msg( 'revisionslider-label-page-size' ) + mw.msg( 'colon-separator' ) ) );
	},

	/**
	 * Generates the HTML for the change size label
	 *
	 * @private
	 * @param {number} relativeSize
	 * @return {jQuery}
	 */
	makeChangeSizeLine: function ( relativeSize ) {
		let changeSizeClass = 'mw-revslider-change-none',
			leadingSign = '';

		if ( relativeSize > 0 ) {
			changeSizeClass = 'mw-revslider-change-positive';
			leadingSign = '+';
		} else if ( relativeSize < 0 ) {
			changeSizeClass = 'mw-revslider-change-negative';
		}

		// Classes are documented above
		// eslint-disable-next-line mediawiki/class-doc
		const $changeNumber = $( '<span>' )
			.addClass( changeSizeClass )
			.attr( {
				dir: 'ltr' // Make sure that minus/plus is on the left
			} )
			.text( leadingSign + mw.language.convertNumber( relativeSize ) );

		return $( '<p>' ).append(
			$( '<strong>' ).text( mw.msg( 'revisionslider-label-change-size' ) + mw.msg( 'colon-separator' ) ),
			mw.message( 'revisionslider-change-size', $changeNumber, relativeSize, Math.abs( relativeSize ) ).parseDom()
		);
	},

	/**
	 * @return {jQuery}
	 */
	getElement: function () {
		return this.$html;
	}
} );

module.exports = RevisionListView;
