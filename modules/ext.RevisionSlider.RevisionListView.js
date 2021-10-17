/**
 * @class RevisionListView
 * @param {RevisionList} revisionList
 * @param {string} [dir]
 * @constructor
 */
function RevisionListView( revisionList, dir ) {
	this.revisionList = revisionList;
	this.dir = dir;
}

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
	allowHover: true,

	/**
	 * @type {string}
	 */
	dir: null,

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
	 * @param {number} positionOffset
	 * @return {jQuery}
	 */
	render: function ( revisionTickWidth, positionOffset ) {
		var revs = this.revisionList.getRevisions(),
			maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() ),
			self = this;

		positionOffset = positionOffset || 0;
		this.revisionWidth = revisionTickWidth;

		this.$html = $( '<div>' ).addClass( 'mw-revslider-revisions' );

		for ( var i = 0; i < revs.length; i++ ) {
			var diffSize = revs[ i ].getRelativeSize();
			var relativeChangeSize = this.calcRelativeChangeSize( diffSize, maxChangeSizeLogged );

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
						if ( self.allowHover ) {
							self.setRevisionHovered( $( this ), event );
						}
					} )
					.on( 'mouseleave', function () {
						self.unsetRevisionHovered( $( this ) );
					} )
				);
		}

		this.keepTooltipsOnHover();
		this.closeTooltipsOnClick();

		return this.$html;
	},

	enableHover: function () {
		this.allowHover = true;
	},

	disableHover: function () {
		this.allowHover = false;
		this.unsetAllHovered();
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 * @param {MouseEvent} event
	 */
	setRevisionHovered: function ( $revisionWrapper, event ) {
		if ( !$revisionWrapper.length ) {
			return;
		}

		var hasMovedTop = event.pageY - $revisionWrapper.offset().top < $revisionWrapper.height() / 2,
			isOlderTop = $revisionWrapper.hasClass( 'mw-revslider-revision-older' ) && hasMovedTop,
			isNewerBottom = $revisionWrapper.hasClass( 'mw-revslider-revision-newer' ) && !hasMovedTop,
			$neighborRevisionWrapper = $revisionWrapper;

		this.showTooltip( $revisionWrapper );

		if ( isOlderTop ) {
			$neighborRevisionWrapper = $revisionWrapper.prev();
		} else if ( isNewerBottom ) {
			$neighborRevisionWrapper = $revisionWrapper.next();
		}

		if ( $neighborRevisionWrapper.length === 0 ) {
			return;
		}

		if ( hasMovedTop ) {
			this.setRevisionGhost( $revisionWrapper.find( '.mw-revslider-revision-wrapper-up' ) );
			if ( isOlderTop ) {
				this.setRevisionGhost( $neighborRevisionWrapper.find( '.mw-revslider-revision-wrapper-down' ) );
			}
		} else {
			this.setRevisionGhost( $revisionWrapper.find( '.mw-revslider-revision-wrapper-down' ) );
			if ( isNewerBottom ) {
				this.setRevisionGhost( $neighborRevisionWrapper.find( '.mw-revslider-revision-wrapper-up' ) );
			}
		}
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 * @return {number}
	 */
	getRevisionWrapperPos: function ( $revisionWrapper ) {
		return +$revisionWrapper.find( '.mw-revslider-revision' ).attr( 'data-pos' );
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 */
	setRevisionGhost: function ( $revisionWrapper ) {
		$revisionWrapper.addClass( 'mw-revslider-revision-hovered' );
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 */
	unsetRevisionHovered: function ( $revisionWrapper ) {
		this.unsetRevisionGhosts( $revisionWrapper );
		this.hideTooltip( $revisionWrapper );
	},

	unsetAllHovered: function () {
		$( '.mw-revslider-revision-wrapper-up, .mw-revslider-revision-wrapper-down' )
			.removeClass( 'mw-revslider-revision-hovered' );
	},

	/**
	 * @param {jQuery} $revisionWrapper
	 */
	unsetRevisionGhosts: function ( $revisionWrapper ) {
		$revisionWrapper.children()
			.add( $revisionWrapper.prev().children() )
			.add( $revisionWrapper.next().children() )
			.removeClass( 'mw-revslider-revision-hovered' );
	},

	/**
	 * @param {jQuery} $renderedList
	 */
	adjustRevisionSizes: function ( $renderedList ) {
		var revs = this.revisionList.getRevisions(),
			maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() );

		for ( var i = 0; i < revs.length; i++ ) {
			var diffSize = revs[ i ].getRelativeSize();
			var relativeChangeSize = this.calcRelativeChangeSize( diffSize, maxChangeSizeLogged );

			$renderedList.find( '.mw-revslider-revision[data-pos="' + ( i + 1 ) + '"]' ).css( {
				height: relativeChangeSize + 'px',
				top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
			} );
		}
	},

	calcRelativeChangeSize: function ( diffSize, maxChangeSizeLogged ) {
		if ( diffSize === 0 ) {
			return 0;
		}
		return Math.ceil(
			( this.maxRevisionHeight - this.minRevisionHeight ) *
				Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) +
			this.minRevisionHeight;
	},

	/**
	 * Hides the current tooltip immediately
	 */
	hideCurrentTooltip: function () {
		window.clearTimeout( this.tooltipTimeout );
		$( '.mw-revslider-revision-wrapper-hovered' )
			.removeClass( 'mw-revslider-revision-wrapper-hovered' );
		$( '.mw-revslider-revision-tooltip' ).remove();
	},

	/**
	 * Hides the tooltip after 500ms
	 *
	 * @param {jQuery} $revisionWrapper
	 */
	hideTooltip: function ( $revisionWrapper ) {
		this.tooltipTimeout = window.setTimeout( function () {
			$revisionWrapper.removeClass( 'mw-revslider-revision-wrapper-hovered' );
			$( '.mw-revslider-revision-tooltip' ).remove();
		}, 500 );
	},

	/**
	 * Hides the previous tooltip and shows the new one
	 *
	 * @param {jQuery} $revisionWrapper
	 */
	showTooltip: function ( $revisionWrapper ) {
		var pos = +$revisionWrapper.find( '.mw-revslider-revision' ).attr( 'data-pos' ),
			revId = +$revisionWrapper.find( '.mw-revslider-revision' ).attr( 'data-revid' ),
			revision = this.getRevisionWithId( revId );
		if ( revision === null ) {
			return;
		}

		this.hideCurrentTooltip();

		var tooltip = this.makeTooltip( revision, $revisionWrapper );
		// eslint-disable-next-line mediawiki/class-doc
		tooltip.$element.addClass( 'mw-revslider-revision-tooltip-' + pos );

		$( 'body' ).append( tooltip.$element );
		tooltip.toggle( true );

		$revisionWrapper.addClass( 'mw-revslider-revision-wrapper-hovered' );
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
			.on( 'mouseenter', '.mw-revslider-revision-tooltip', function () {
				window.clearTimeout( self.tooltipTimeout );
			} )
			.on( 'mouseleave', '.mw-revslider-revision-tooltip', function () {
				self.hideTooltip( $( '.mw-revslider-revision-wrapper-hovered' ) );
			} );
	},

	/**
	 * Sets an event handler to close tooltips when clicking somewhere outside
	 */
	closeTooltipsOnClick: function () {
		var self = this;

		$( document )
			.on( 'click', function ( event ) {
				if ( $( event.target ).closest( '.mw-revslider-revision-tooltip' ).length === 0 &&
					$( event.target ).closest( '.mw-revslider-revisions-container' ).length === 0 ) {
					self.hideCurrentTooltip();
				}
			} );
	},

	/**
	 * Generates the HTML for a tooltip that appears on hover above each revision on the slider
	 *
	 * @param {Revision} revision
	 * @param {jQuery} $revisionWrapper
	 * @return {OO.ui.PopupWidget}
	 */
	makeTooltip: function ( revision, $revisionWrapper ) {
		var $tooltip = $( '<div>' )
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
				revision.isMinor() ? $( '<p>' ).text( mw.message( 'revisionslider-minoredit' ).text() ) : '',
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
		var self = this;

		if ( !userString ) {
			return '';
		}
		if ( !userGender ) {
			userGender = 'unknown';
		}

		var $userBubble = $( '<div>' ).addClass( 'mw-revslider-bubble' )
			.on( 'click mouseenter mouseleave', function ( event ) {
				self.setUserFilterEvents( $( this ), userString, event );
			} );
		var $userLine = $( '<p>' ).addClass( 'mw-revslider-highlightable-row mw-revslider-username-row' ).append(
			$( '<strong>' ).text( mw.msg( 'revisionslider-label-username', userGender ) + mw.msg( 'colon-separator' ) ),
			$( '<bdi>' ).append(
				$( '<a>' ).addClass( 'mw-userlink' ).attr( 'href', mw.util.getUrl( this.getUserPage( userString ) ) ).text( this.stripInvalidCharacters( userString ) )
			),
			$userBubble
		);

		if ( self.selectedUser === userString ) {
			self.selectedTag = '';
			$userLine.addClass( 'mw-revslider-highlight' );
			$userBubble.addClass( 'mw-revslider-highlite-bubble' );
		}

		return $userLine;
	},

	/**
	 * Set user filter events for revisions
	 *
	 * @param {jQuery} $userBubble
	 * @param {string} userName
	 * @param {MouseEvent} event
	 */
	setUserFilterEvents: function ( $userBubble, userName, event ) {
		var self = this,
			$userLine = $userBubble.parent();

		if ( self.selectedUser === userName && event.type !== 'click' ) {
			return;
		}

		self.removeRevisionHighlight();

		switch ( event.type ) {
			case 'mouseenter':
				$userLine.addClass( 'mw-revslider-highlight' );
				$userBubble.addClass( 'mw-revslider-highlite-bubble' );
				self.highlightSameUserRevisions( userName );
				break;
			case 'mouseleave':
				self.reApplySavedHighlighting( $userLine, $userBubble );
				break;
			case 'click':
				var oldUser = self.selectedUser;
				self.resetRevisionHighlighting();

				$userLine.addClass( 'mw-revslider-highlight' );
				$userBubble.addClass( 'mw-revslider-highlite-bubble' );

				if ( oldUser !== userName ) {
					self.highlightSameUserRevisions( userName );
					self.selectedUser = userName;
				}
				break;
		}
	},

	/**
	 * Highlights revisions of the sameUser
	 *
	 * @param {string} userString
	 */
	highlightSameUserRevisions: function ( userString ) {
		$( '[data-user="' + userString + '"]' ).parent()
			.toggleClass( 'mw-revslider-revision-highlight' );
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
	 * Generates the HTML for the tags label
	 *
	 * @param {Revision} rev
	 * @return {string|jQuery}
	 */
	makeTagsLine: function ( rev ) {
		var self = this;

		if ( rev.hasNoTags() ) {
			return '';
		}

		var tags = rev.getTags();
		var $tagLines = $( '<div>' );

		for ( var i = 0; i < tags.length; i++ ) {
			var $tagBubble = $( '<div>' ).addClass( 'mw-revslider-bubble' )
				.on( 'click mouseenter mouseleave', function ( event ) {
					self.setTagFilterEvents( $( this ), event );
				} );
			var $tagLine = $( '<div>' ).addClass( 'mw-revslider-highlightable-row mw-revslider-tag-row' ).append(
				tags[ i ],
				$tagBubble,
				'<br>'
			);

			if ( self.selectedTag === tags[ i ] ) {
				self.selectedUser = '';
				$tagLine.addClass( 'mw-revslider-highlight' );
				$tagLine.find( $tagBubble ).addClass( 'mw-revslider-highlite-bubble' );
			}

			$tagLine.attr( 'data-tag-name', tags[ i ] );
			$tagLines.append( $tagLine );
		}

		return $tagLines;
	},

	/**
	 * Set tag filter events for revisions
	 *
	 * @param {jQuery} $tagBubble
	 * @param {MouseEvent} event
	 */
	setTagFilterEvents: function ( $tagBubble, event ) {
		var self = this,
			$tagLine = $tagBubble.parent(),
			tagName = $tagLine.data( 'tag-name' );

		if ( self.selectedTag === tagName && event.type !== 'click' ) {
			return;
		}

		self.removeRevisionHighlight();

		switch ( event.type ) {
			case 'mouseenter':
				$tagLine.addClass( 'mw-revslider-highlight' );
				$tagBubble.addClass( 'mw-revslider-highlite-bubble' );
				self.highlightSameTagRevisions( tagName );
				break;
			case 'mouseleave':
				self.reApplySavedHighlighting( $tagLine, $tagBubble );
				break;
			case 'click':
				var oldTag = self.selectedTag;
				self.resetRevisionHighlighting();

				$tagLine.addClass( 'mw-revslider-highlight' );
				$tagBubble.addClass( 'mw-revslider-highlite-bubble' );

				if ( oldTag !== tagName ) {
					self.highlightSameTagRevisions( tagName );
					self.selectedTag = tagName;
				}
				break;
		}
	},

	/**
	 * Highlights same tag revisions
	 *
	 * @param {string} tagName
	 */
	highlightSameTagRevisions: function ( tagName ) {
		var revs = this.revisionList.getRevisions();

		for ( var i = 0; i < revs.length; i++ ) {
			var revTags = revs[ i ].getTags();
			for ( var j = 0; j < revTags.length; j++ ) {
				if ( tagName === revTags[ j ] ) {
					$( '[data-revid="' + revs[ i ].id + '"]' ).parent()
						.addClass( 'mw-revslider-revision-highlight' );
				}
			}
		}
	},

	/**
	 * Re-apply highlighting from saved state
	 *
	 * @param {jQuery} $line
	 * @param {jQuery} $bubble
	 */
	reApplySavedHighlighting: function ( $line, $bubble ) {
		$line.removeClass( 'mw-revslider-highlight' );
		$bubble.removeClass( 'mw-revslider-highlite-bubble' );
		if ( this.selectedTag ) {
			this.highlightSameTagRevisions( this.selectedTag );
		}
		if ( this.selectedUser ) {
			this.highlightSameUserRevisions( this.selectedUser );
		}
	},

	/**
	 * Removes the highlighting from the revisions
	 */
	removeRevisionHighlight: function () {
		$( '.mw-revslider-revision-wrapper' ).removeClass( 'mw-revslider-revision-highlight' );
	},

	/**
	 * Resets highlighting setting state
	 */
	resetRevisionHighlighting: function () {
		$( '.mw-revslider-highlightable-row' ).removeClass( 'mw-revslider-highlight' );
		$( '.mw-revslider-bubble' ).removeClass( 'mw-revslider-highlite-bubble' );
		this.selectedTag = '';
		this.selectedUser = '';
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
			leadingSign = '';

		if ( relativeSize > 0 ) {
			changeSizeClass = 'mw-revslider-change-positive';
			leadingSign = '+';
		} else if ( relativeSize < 0 ) {
			changeSizeClass = 'mw-revslider-change-negative';
		}

		// Classes are documented above
		// eslint-disable-next-line mediawiki/class-doc
		var $changeNumber = $( '<span>' )
			.addClass( changeSizeClass )
			.attr( {
				dir: 'ltr' // Make sure that minus/plus is on the left
			} )
			.text( leadingSign + mw.language.convertNumber( relativeSize ) );

		return $( '<p>' ).append(
			$( '<strong>' ).text( mw.msg( 'revisionslider-label-change-size' ) + mw.msg( 'colon-separator' ) ),
			mw.message( 'revisionslider-change-size', $changeNumber, relativeSize, Math.abs( relativeSize ) ).parse()
		);
	},

	/**
	 * Set direction for the view
	 *
	 * @param {string} dir
	 */
	setDir: function ( dir ) {
		this.dir = dir;
	},

	/**
	 * @return {jQuery}
	 */
	getElement: function () {
		return this.$html;
	}
} );

module.exports = RevisionListView;
