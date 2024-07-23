const DiffPage = require( './ext.RevisionSlider.DiffPage.js' ),
	HelpButtonView = require( './ext.RevisionSlider.HelpButtonView.js' ),
	makeRevisions = require( './ext.RevisionSlider.RevisionList.js' ).makeRevisions,
	Pointer = require( './ext.RevisionSlider.Pointer.js' ),
	RevisionListView = require( './ext.RevisionSlider.RevisionListView.js' ),
	RevisionSliderApi = require( './ext.RevisionSlider.Api.js' ),
	SliderArrowView = require( './ext.RevisionSlider.SliderArrowView.js' ),
	utils = require( './ext.RevisionSlider.util.js' );

/**
 * Module handling the view logic of the RevisionSlider slider
 *
 * @class SliderView
 * @param {Slider} slider
 * @param {DiffPage} [diffPage] Defaults to creating a new DiffPage without parameters
 * @constructor
 */
function SliderView( slider, diffPage ) {
	this.slider = slider;
	this.diffPage = diffPage || new DiffPage();
	this.diffPage.addHandlersToCoreLinks( this );
	this.diffPage.initOnPopState( this );
}

Object.assign( SliderView.prototype, {

	revisionWidth: 16,
	containerMargin: 140,
	outerMargin: 20,

	/** @type {jQuery} */
	$element: null,
	/** @type {DiffPage} */
	diffPage: null,
	/** @type {Slider} */
	slider: null,
	/** @type {Pointer} */
	pointerOlder: null,
	/** @type {Pointer} */
	pointerNewer: null,
	/** @type {OO.ui.ButtonWidget} */
	backwardArrowButton: null,
	/** @type {OO.ui.ButtonWidget} */
	forwardArrowButton: null,
	/** @type {boolean} */
	noMoreNewerRevisions: false,
	/** @type {boolean} */
	noMoreOlderRevisions: false,
	/** @type {string|null} */
	dir: null,
	/** @type {boolean} */
	isDragged: false,
	/** @type {boolean} */
	escapePressed: false,
	/** @type {number|null} */
	lastOldPointerPosition: null,
	/** @type {number|null} */
	lastNewPointerPosition: null,

	render: function ( $container ) {
		const containerWidth = this.calculateSliderContainerWidth(),
			$revisions = this.getRevisionListView().render( this.revisionWidth ),
			sliderArrowView = new SliderArrowView( this );

		this.dir = $container.css( 'direction' );

		this.pointerOlder = this.pointerOlder || new Pointer( 'mw-revslider-pointer-older' );
		this.pointerNewer = this.pointerNewer || new Pointer( 'mw-revslider-pointer-newer' );

		this.backwardArrowButton = sliderArrowView.renderArrowButton( -1 );
		this.forwardArrowButton = sliderArrowView.renderArrowButton( 1 );

		this.$element = $( '<div>' )
			.addClass( 'mw-revslider-revision-slider' )
			.css( {
				direction: $container.css( 'direction' ),
				width: ( containerWidth + this.containerMargin ) + 'px'
			} )
			.append(
				this.backwardArrowButton.$element,
				this.renderRevisionsContainer( containerWidth, $revisions ),
				this.renderPointerContainer( containerWidth ),
				this.forwardArrowButton.$element,
				$( '<div>' ).css( { clear: 'both' } ),
				this.pointerOlder.getLine().getElement(), this.pointerNewer.getLine().getElement(),
				HelpButtonView.render()
			);

		this.initPointers( $revisions );

		this.slider.setRevisionsPerWindow( this.$element.find( '.mw-revslider-revisions-container' ).width() / this.revisionWidth );

		this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
		this.resetRevisionStylesBasedOnPointerPosition( $revisions );
		this.addClickHandlerToRevisions( $revisions );

		$container.empty().append( this.$element );

		this.slideView( Math.floor( ( this.getNewerPointerPos() - 1 ) / this.slider.getRevisionsPerWindow() ), 0 );
		this.diffPage.replaceState( mw.config.get( 'wgDiffNewId' ), mw.config.get( 'wgDiffOldId' ), this );
	},

	/**
	 * Renders the revisions container and adds the revisions to it
	 *
	 * @private
	 * @param {number} containerWidth
	 * @param {jQuery} $revisions
	 * @return {jQuery} the revisions container
	 */
	renderRevisionsContainer: function ( containerWidth, $revisions ) {
		return $( '<div>' )
			.addClass( 'mw-revslider-revisions-container' )
			.css( {
				width: containerWidth + 'px'
			} )
			.append( $revisions );
	},

	/**
	 * Renders the pointer container and adds the pointers to it
	 *
	 * @private
	 * @param {number} containerWidth
	 * @return {jQuery} the pointer container
	 */
	renderPointerContainer: function ( containerWidth ) {
		const self = this;
		const pointerContainerWidth = containerWidth + this.revisionWidth - 1;
		let pointerContainerPosition = 53,
			pointerContainerStyle, lastMouseMoveRevisionPos;

		pointerContainerStyle = { left: pointerContainerPosition + 'px', width: pointerContainerWidth + 'px' };
		if ( this.dir === 'rtl' ) {
			// Due to properly limit dragging a pointer on the right side of the screen,
			// there must some extra space added to the right of the revision bar container
			// For this reason right position of the pointer container in the RTL mode is
			// a bit moved off right compared to its left position in the LTR mode
			pointerContainerPosition = pointerContainerPosition - this.revisionWidth + 1;
			pointerContainerStyle = { right: pointerContainerPosition + 'px', width: pointerContainerWidth + 'px' };
		}

		return $( '<div>' )
			.addClass( 'mw-revslider-pointer-container' )
			.css( pointerContainerStyle )
			.append( this.renderPointerContainers() )
			.on( 'click', this.revisionsClickHandler.bind( this ) )
			.on( 'mouseout', () => {
				if ( !self.isDragged ) {
					self.getRevisionListView().removeAllRevisionPreviewHighlights();
				}
			} )
			.on( 'mouseover', ( event ) => {
				if ( !self.isDragged ) {
					lastMouseMoveRevisionPos = self.pointerContainerMouseMoveHandler(
						event,
						null
					);
				}
			} )
			.on( 'mousemove', ( event ) => {
				if ( !self.isDragged ) {
					lastMouseMoveRevisionPos = self.pointerContainerMouseMoveHandler(
						event,
						lastMouseMoveRevisionPos
					);
				}
			} );
	},

	/**
	 * @private
	 * @return {jQuery[]}
	 */
	renderPointerContainers: function () {
		return [
			$( '<div>' )
				.addClass( 'mw-revslider-pointer-container-older' )
				.append(
					$( '<div>' ).addClass( 'mw-revslider-slider-line' ),
					this.pointerOlder.getView().getElement()
				),
			$( '<div>' )
				.addClass( 'mw-revslider-pointer-container-newer' )
				.append(
					$( '<div>' ).addClass( 'mw-revslider-slider-line' ),
					this.pointerNewer.getView().getElement()
				)
		];
	},

	/**
	 * Initializes the pointer dragging logic
	 *
	 * @private
	 * @param {jQuery} $revisions
	 */
	initPointers: function ( $revisions ) {
		const $pointers = this.$element.find( '.mw-revslider-pointer' ),
			$pointerOlder = this.pointerOlder.getView().getElement(),
			$pointerNewer = this.pointerNewer.getView().getElement(),
			self = this;

		$pointerNewer.attr( 'tabindex', 0 );
		$pointerOlder.attr( 'tabindex', 0 );

		$( document.body ).on( 'keydown', ( e ) => {
			if ( e.which === OO.ui.Keys.ESCAPE ) {
				self.escapePressed = true;
				$pointers.trigger( 'mouseup' );
			}
		} );

		$pointers
			.on( 'focus', ( event ) => {
				self.onPointerFocus( event, $revisions );
			} )
			.on( 'blur', this.getRevisionListView().onFocusBlur.bind( this.getRevisionListView() ) )
			.on( 'keydown', function ( event ) {
				self.buildTabbingRulesOnKeyDown( $( this ), event, $revisions );
			} )
			.on( 'keyup', function ( event ) {
				self.buildTabbingRulesOnKeyUp( $( this ), event, $revisions );
			} )
			.on(
				'touchstart touchmove touchend touchcancel touchleave',
				utils.touchEventConverter
			);

		$pointerOlder.draggable( this.buildDraggableOptions(
			$revisions,
			'.mw-revslider-pointer-container-older'
		) );

		$pointerNewer.draggable( this.buildDraggableOptions(
			$revisions,
			'.mw-revslider-pointer-container-newer'
		) );
	},

	/**
	 * @private
	 * @return {number}
	 */
	getOlderPointerPos: function () {
		return this.pointerOlder.getPosition();
	},

	/**
	 * @private
	 * @return {number}
	 */
	getNewerPointerPos: function () {
		return this.pointerNewer.getPosition();
	},

	/**
	 * @private
	 * @param {number} pos
	 * @return {number}
	 */
	setOlderPointerPos: function ( pos ) {
		return this.pointerOlder.setPosition( pos );
	},

	/**
	 * @private
	 * @param {number} pos
	 * @return {number}
	 */
	setNewerPointerPos: function ( pos ) {
		return this.pointerNewer.setPosition( pos );
	},

	/**
	 * @private
	 * @param {MouseEvent} event
	 * @param {number} lastValidPosition
	 * @return {number}
	 */
	pointerContainerMouseMoveHandler: function ( event, lastValidPosition ) {
		const pos = this.getRevisionPositionFromLeftOffset( event.pageX );

		if ( pos === lastValidPosition ) {
			return pos;
		}

		const $hoveredRevisionWrapper = this.getRevElementAtPosition( this.getRevisionsElement(), pos ).parent();
		this.getRevisionListView().removeAllRevisionPreviewHighlights();
		if ( $hoveredRevisionWrapper.length ) {
			this.getRevisionListView().onRevisionHover( $hoveredRevisionWrapper, event );
		}

		return pos;
	},

	/**
	 * React on clicks on a revision element and move pointers
	 *
	 * @private
	 * @param {MouseEvent} event
	 */
	revisionsClickHandler: function ( event ) {
		let clickedPos;
		// Just use the information from the element that received the click, if available
		const $revElement = $( event.currentTarget ).find( '.mw-revslider-revision' );
		if ( $revElement.length === 1 ) {
			clickedPos = +$revElement.attr( 'data-pos' );
		} else {
			clickedPos = this.getRevisionPositionFromLeftOffset( event.pageX );
		}
		const $revisionWrapper = this.getRevElementAtPosition( this.getRevisionsElement(), clickedPos ).parent();
		// Fail-safe in case a mouse click outside the valid range is picked up
		if ( !$revisionWrapper.length ) {
			return;
		}
		const hasClickedTop = event.pageY - $revisionWrapper.offset().top < $revisionWrapper.height() / 2;
		let newNewerPointerPos, newOlderPointerPos;

		if ( hasClickedTop &&
			( $revisionWrapper.hasClass( 'mw-revslider-revision-newer' ) ||
				$revisionWrapper.hasClass( 'mw-revslider-revision-intermediate' ) )
		) {
			newNewerPointerPos = clickedPos;
			newOlderPointerPos = this.pointerOlder.getPosition();
		} else if ( !hasClickedTop &&
			( $revisionWrapper.hasClass( 'mw-revslider-revision-older' ) ||
				$revisionWrapper.hasClass( 'mw-revslider-revision-intermediate' ) )
		) {
			newNewerPointerPos = this.pointerNewer.getPosition();
			newOlderPointerPos = clickedPos;
		} else {
			newNewerPointerPos = clickedPos;
			newOlderPointerPos = clickedPos;
			if ( hasClickedTop ) {
				newOlderPointerPos--;
			} else {
				newNewerPointerPos++;
			}
		}

		if (
			newOlderPointerPos === newNewerPointerPos ||
			!this.slider.getRevisionList().isValidPosition( newOlderPointerPos ) ||
			!this.slider.getRevisionList().isValidPosition( newNewerPointerPos )
		) {
			return;
		}

		this.updatePointersAndDiffView( newNewerPointerPos, newOlderPointerPos );
	},

	/**
	 * @private
	 * @param {jQuery} $revisions
	 */
	addClickHandlerToRevisions: function ( $revisions ) {
		$revisions.find( '.mw-revslider-revision-wrapper' )
			.on( 'click', this.revisionsClickHandler.bind( this ) );
	},

	/**
	 * @private
	 * @param {MouseEvent} event
	 * @param {jQuery} $revisions
	 */
	onPointerFocus: function ( event, $revisions ) {
		const $hoveredRevisionWrapper = this.getRevElementAtPosition(
			$revisions,
			this.whichPointer( $( event.target ) ).getPosition()
		).parent();
		this.getRevisionListView().setRevisionFocus( $hoveredRevisionWrapper );

	},

	/**
	 * Build rules for tabbing when `keydown` event triggers on pointers
	 *
	 * @private
	 * @param {jQuery} $pointer
	 * @param {KeyboardEvent} event
	 * @param {jQuery} $revisions
	 */
	buildTabbingRulesOnKeyDown: function ( $pointer, event, $revisions ) {
		const oldPos = this.getOlderPointerPos(),
			newPos = this.getNewerPointerPos(),
			pointer = this.whichPointer( $pointer ),
			isNewer = pointer.getView().isNewerPointer();
		let offset = 0;

		if ( event.which === ( this.dir === 'rtl' ? OO.ui.Keys.LEFT : OO.ui.Keys.RIGHT ) ) {
			offset = 1;

			if ( isNewer ) {
				if ( newPos === this.slider.getNewestVisibleRevisionIndex() + 1 ) {
					return;
				}
				this.setNewerPointerPos( newPos + 1 );
			} else {
				if ( oldPos !== newPos - 1 ) {
					this.setOlderPointerPos( oldPos + 1 );
				}
			}
		} else if ( event.which === ( this.dir === 'rtl' ? OO.ui.Keys.RIGHT : OO.ui.Keys.LEFT ) ) {
			offset = -1;

			if ( isNewer ) {
				if ( oldPos !== newPos - 1 ) {
					this.setNewerPointerPos( newPos - 1 );
				}
			} else {
				if ( oldPos === this.slider.getOldestVisibleRevisionIndex() + 1 ) {
					return;
				}
				this.setOlderPointerPos( oldPos - 1 );
			}
		} else if ( event.which !== OO.ui.Keys.ENTER ) {
			return;
		}

		this.resetRevisionStylesBasedOnPointerPosition( $revisions );
		this.alignPointersAndLines( 1 );

		const pos = this.getRevisionPositionFromLeftOffset(
			$pointer.offset().left + this.revisionWidth / 2
		) + offset;

		const $hoveredRevisionWrapper = this.getRevElementAtPosition( $revisions, pos ).parent();

		if ( $( '.mw-revslider-revision-tooltip' ).length && event.which === OO.ui.Keys.ENTER ) {
			this.getRevisionListView().removeCurrentRevisionFocus();
		} else {
			this.getRevisionListView().setRevisionFocus( $hoveredRevisionWrapper );
		}

	},

	/**
	 * Build rules for tabbing when `keyup` event triggers on pointers
	 *
	 * @private
	 * @param {jQuery} $pointer
	 * @param {KeyboardEvent} event
	 * @param {jQuery} $revisions
	 */
	buildTabbingRulesOnKeyUp: function ( $pointer, event, $revisions ) {
		if ( event.which !== OO.ui.Keys.RIGHT && event.which !== OO.ui.Keys.LEFT ) {
			return;
		}

		const diff = +this.getRevElementAtPosition(
			$revisions, this.getNewerPointerPos()
		).attr( 'data-revid' );

		const oldid = +this.getRevElementAtPosition(
			$revisions, this.getOlderPointerPos()
		).attr( 'data-revid' );

		this.lastRequest = this.refreshDiffView( diff, oldid );

		this.lastRequest.then( () => {
			$pointer.trigger( 'focus' );
		} );
	},

	/**
	 * Build options for the draggable
	 *
	 * @private
	 * @param {jQuery} $revisions
	 * @param {string} containmentClass
	 * @return {Object}
	 */
	buildDraggableOptions: function ( $revisions, containmentClass ) {
		let lastValidLeftPos;
		const self = this;

		return {
			axis: 'x',
			grid: [ this.revisionWidth, null ],
			containment: containmentClass,
			start: function () {
				if ( self.pointerIsBlockedByOther( this ) ) {
					return false;
				}
				self.isDragged = true;
				self.getRevisionListView().enableRevisionPreviewHighlights( false );
				self.setPointerDragCursor();
				self.fadeOutPointerLines( true );
				self.escapePressed = false;
				self.lastOldPointerPosition = self.getOlderPointerPos();
				self.lastNewPointerPosition = self.getNewerPointerPos();
			},
			stop: function () {
				const $p = $( this ),
					relativeIndex = self.getRelativePointerIndex( $p ),
					pointer = self.whichPointer( $p );

				self.isDragged = false;
				self.getRevisionListView().enableRevisionPreviewHighlights();
				self.setPointerDragCursor( false );

				if ( self.escapePressed ) {
					return;
				}

				mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );

				pointer.setPosition( self.slider.getOldestVisibleRevisionIndex() + relativeIndex );

				const diff = +self.getRevElementAtPosition(
					$revisions, self.getNewerPointerPos()
				).attr( 'data-revid' );

				const oldid = +self.getRevElementAtPosition(
					$revisions, self.getOlderPointerPos()
				).attr( 'data-revid' );

				if ( self.getNewerPointerPos() === self.lastNewPointerPosition &&
					self.getOlderPointerPos() === self.lastOldPointerPosition ) {
					return;
				}

				self.refreshDiffView( diff, oldid );
				self.alignPointersAndLines( 0 );
				self.resetRevisionStylesBasedOnPointerPosition( $revisions );
			},
			drag: function ( event, ui ) {
				lastValidLeftPos = self.draggableDragAction(
					event,
					ui,
					this,
					lastValidLeftPos
				);
			},
			revert: function () {
				return self.escapePressed;
			}
		};
	},

	/**
	 * @private
	 * @param {Element} pointerElement
	 * @return {boolean}
	 */
	pointerIsBlockedByOther: function ( pointerElement ) {
		const pointer = this.whichPointer( $( pointerElement ) ),
			isNewer = pointer.getView().isNewerPointer();

		return ( isNewer && this.getOlderPointerPos() >= this.slider.getNewestVisibleRevisionIndex() + 1 ) ||
			( !isNewer && this.getNewerPointerPos() <= this.slider.getOldestVisibleRevisionIndex() + 1 );
	},

	/**
	 * @private
	 * @param {Event} event
	 * @param {Object} ui
	 * @param {Element} pointer
	 * @param {number} lastValidLeftPos
	 * @return {number}
	 */
	draggableDragAction: function ( event, ui, pointer, lastValidLeftPos ) {
		const pos = this.getRevisionPositionFromLeftOffset(
			$( pointer ).offset().left + this.revisionWidth / 2
		);

		if ( pos === lastValidLeftPos ) {
			return pos;
		}

		const $revisions = this.getRevisionsElement();
		const $hoveredRevisionWrapper = this.getRevElementAtPosition( $revisions, pos ).parent();
		this.getRevisionListView().setRevisionFocus( $hoveredRevisionWrapper );

		return pos;
	},

	/**
	 * @private
	 * @param {number} leftOffset
	 * @return {number}
	 */
	getRevisionPositionFromLeftOffset: function ( leftOffset ) {
		const $revisions = this.getRevisionsElement(),
			revisionsX = utils.correctElementOffsets( $revisions.offset() ).left;
		let pos = Math.ceil( Math.abs( leftOffset - revisionsX ) / this.revisionWidth );

		if ( this.dir === 'rtl' ) {
			// pre-loading the revisions on the right side leads to shifted position numbers
			if ( this.slider.isAtStart() ) {
				pos = this.slider.getRevisionsPerWindow() - pos + 1;
			} else {
				pos += this.slider.getRevisionsPerWindow();
			}
		}

		return pos;
	},

	/**
	 * @private
	 * @param {boolean} [show=true]
	 */
	setPointerDragCursor: function ( show ) {
		$( '.mw-revslider-pointer, ' +
			'.mw-revslider-pointer-container, ' +
			'.mw-revslider-pointer-container-newer, ' +
			'.mw-revslider-pointer-container-older, ' +
			'.mw-revslider-pointer-line, ' +
			'.mw-revslider-revision-wrapper' )
			.toggleClass( 'mw-revslider-pointer-grabbing', show !== false );
	},

	/**
	 * Get the relative index for a pointer.
	 *
	 * @private
	 * @param {jQuery} $pointer
	 * @return {number}
	 */
	getRelativePointerIndex: function ( $pointer ) {
		let pos = $pointer.position().left;
		const pointer = this.whichPointer( $pointer );

		if ( this.dir === 'rtl' ) {
			pos = pointer.getView().getAdjustedLeftPositionWhenRtl( pos );
		}
		return Math.ceil( ( pos + this.revisionWidth / 2 ) / this.revisionWidth );
	},

	/**
	 * Loads a new diff and optionally adds a state to the history
	 *
	 * @private
	 * @param {number} diff
	 * @param {number} oldid
	 * @param {boolean} [pushState=true] False to skip manipulating the browser history
	 * @return {jQuery}
	 */
	refreshDiffView: function ( diff, oldid, pushState ) {
		this.diffPage.refresh( diff, oldid, this );
		if ( pushState !== false ) {
			this.diffPage.pushState( diff, oldid, this );
		}
		return this.diffPage.lastRequest;
	},

	showNextDiff: function () {
		this.updatePointersAndDiffView(
			this.getNewerPointerPos() + 1,
			this.getNewerPointerPos()
		);
	},

	showPrevDiff: function () {
		this.updatePointersAndDiffView(
			this.getOlderPointerPos(),
			this.getOlderPointerPos() - 1
		);
	},

	/**
	 * Updates and moves pointers to new positions, resets styles and refreshes diff accordingly
	 *
	 * @param {number} newPointerPos
	 * @param {number} oldPointerPos
	 * @param {boolean} [pushState=true] False to skip manipulating the browser history
	 */
	updatePointersAndDiffView: function (
		newPointerPos,
		oldPointerPos,
		pushState
	) {
		this.setNewerPointerPos( newPointerPos );
		this.setOlderPointerPos( oldPointerPos );
		this.alignPointersAndLines();
		this.resetRevisionStylesBasedOnPointerPosition( this.getRevisionsElement() );
		this.refreshDiffView(
			+$( '.mw-revslider-revision[data-pos="' + newPointerPos + '"]' ).attr( 'data-revid' ),
			+$( '.mw-revslider-revision[data-pos="' + oldPointerPos + '"]' ).attr( 'data-revid' ),
			pushState
		);
	},

	/**
	 * @private
	 * @param {jQuery} $revs
	 * @param {number} pos
	 * @return {jQuery}
	 */
	getRevElementAtPosition: function ( $revs, pos ) {
		return $revs.find( '.mw-revslider-revision[data-pos="' + pos + '"]' );
	},

	/**
	 * Gets the jQuery element of the older selected revision
	 *
	 * @private
	 * @param {jQuery} $revs
	 * @return {jQuery}
	 */
	getOldRevElement: function ( $revs ) {
		return $revs.find( '.mw-revslider-revision[data-revid="' + mw.config.get( 'wgDiffOldId' ) + '"]' );
	},

	/**
	 * Gets the jQuery element of the newer selected revision
	 *
	 * @private
	 * @param {jQuery} $revs
	 * @return {jQuery}
	 */
	getNewRevElement: function ( $revs ) {
		return $revs.find( '.mw-revslider-revision[data-revid="' + mw.config.get( 'wgDiffNewId' ) + '"]' );
	},

	/**
	 * Initializes the Pointer objects based on the selected revisions
	 *
	 * @private
	 * @param {jQuery} $oldRevElement
	 * @param {jQuery} $newRevElement
	 */
	initializePointers: function ( $oldRevElement, $newRevElement ) {
		if ( this.getOlderPointerPos() !== 0 || this.getNewerPointerPos() !== 0 ) {
			return;
		}
		if ( $oldRevElement.length === 0 && $newRevElement.length === 0 ) {
			// Note: this is currently caught in init.js
			throw new Error( 'RS-revs-not-specified' );
		}
		this.setOlderPointerPos( $oldRevElement.length ? +$oldRevElement.attr( 'data-pos' ) : -1 );
		this.setNewerPointerPos( +$newRevElement.attr( 'data-pos' ) );
		this.resetSliderLines();
	},

	/**
	 * Resets the slider lines based on the selected revisions
	 *
	 * @private
	 */
	resetSliderLines: function () {
		this.setSliderLineCSS(
			$( '.mw-revslider-pointer-container-older' ),
			this.getOlderDistanceToOldest() + this.getDistanceBetweenPointers(),
			0
		);
		this.setSliderLineCSS(
			$( '.mw-revslider-pointer-container-newer' ),
			this.getNewerDistanceToNewest() + this.getDistanceBetweenPointers() + 2,
			this.getOlderDistanceToOldest()
		);
	},

	/**
	 * @private
	 * @param {jQuery} $lineContainer
	 * @param {number} widthToSet Total width of the line, in position units
	 * @param {number} marginToSet Start of the line from the left, in position units
	 */
	setSliderLineCSS: function ( $lineContainer, widthToSet, marginToSet ) {
		const maxWidth = this.calculateSliderContainerWidth() + this.revisionWidth;
		widthToSet = Math.min( widthToSet * this.revisionWidth, maxWidth );
		marginToSet = Math.max( 0, marginToSet * this.revisionWidth ) - this.revisionWidth / 2;

		$lineContainer.css( 'width', widthToSet );
		if ( this.dir === 'ltr' ) {
			$lineContainer.css( 'margin-left', marginToSet );
		} else {
			$lineContainer.css( 'margin-right', marginToSet + this.revisionWidth );
		}
	},

	/**
	 * @private
	 * @return {number}
	 */
	getOlderDistanceToOldest: function () {
		return this.getOlderPointerPos() - this.slider.getOldestVisibleRevisionIndex();
	},

	/**
	 * @private
	 * @return {number}
	 */
	getNewerDistanceToNewest: function () {
		return this.slider.getNewestVisibleRevisionIndex() - this.getNewerPointerPos();
	},

	/**
	 * @private
	 * @return {number} difference between the two positions, typically 1
	 */
	getDistanceBetweenPointers: function () {
		return this.getNewerPointerPos() - this.getOlderPointerPos();
	},

	/**
	 * Highlights revisions between the pointers
	 *
	 * @private
	 * @param {jQuery} $revisions
	 */
	resetRevisionStylesBasedOnPointerPosition: function ( $revisions ) {
		const olderRevPosition = this.getOlderPointerPos(),
			newerRevPosition = this.getNewerPointerPos(),
			// FIXME: Why do these methods return values that are off by one?
			startPosition = this.slider.getOldestVisibleRevisionIndex() + 1,
			endPosition = this.slider.getNewestVisibleRevisionIndex() + 1;

		// We need to reset these in case they are outside the visible range
		$revisions.find( '.mw-revslider-revision' )
			.removeClass( 'mw-revslider-revision-old mw-revslider-revision-new' );

		this.getRevElementAtPosition( $revisions, olderRevPosition ).addClass( 'mw-revslider-revision-old' );
		this.getRevElementAtPosition( $revisions, newerRevPosition ).addClass( 'mw-revslider-revision-new' );

		for ( let i = startPosition; i <= endPosition; i++ ) {
			const older = i <= olderRevPosition;
			const newer = i >= newerRevPosition;
			this.getRevElementAtPosition( $revisions, i ).parent()
				.toggleClass( 'mw-revslider-revision-older', older )
				.toggleClass( 'mw-revslider-revision-intermediate', !older && !newer )
				.toggleClass( 'mw-revslider-revision-newer', newer );
		}
	},

	/**
	 * Redraws the lines for the pointers
	 *
	 * @private
	 */
	redrawPointerLines: function () {
		this.fadeOutPointerLines( false );
		$( '.mw-revslider-pointer-line-upper, .mw-revslider-pointer-line-lower' )
			.removeClass( 'mw-revslider-bottom-line mw-revslider-left-line mw-revslider-right-line' );
		this.pointerOlder.getLine().drawLine();
		this.pointerNewer.getLine().drawLine();
	},

	/**
	 * @private
	 * @param {boolean} fade
	 */
	fadeOutPointerLines: function ( fade ) {
		$( '.mw-revslider-pointer-line' ).css( 'opacity', fade ? 0.3 : '' );
	},

	/**
	 * @private
	 * @return {number}
	 */
	calculateSliderContainerWidth: function () {
		return Math.min(
			this.slider.getRevisionList().getLength(),
			utils.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth )
		) * this.revisionWidth;
	},

	/**
	 * Slide the view to the next chunk of older / newer revisions
	 *
	 * @param {number} direction - Either -1, 0 or 1
	 * @param {number|string} [duration]
	 */
	slideView: function ( direction, duration ) {
		const $animatedElement = this.$element.find( '.mw-revslider-revisions-container' ),
			self = this;

		this.slider.slide( direction );
		this.pointerOlder.getView().getElement().draggable( 'disable' );
		this.pointerNewer.getView().getElement().draggable( 'disable' );

		this.backwardArrowButton.setDisabled( this.slider.isAtStart() );
		this.forwardArrowButton.setDisabled( this.slider.isAtEnd() );

		$animatedElement.animate(
			{ scrollLeft: this.getScrollLeft() },
			duration,
			null,
			() => {
				self.pointerOlder.getView().getElement().draggable( 'enable' );
				self.pointerNewer.getView().getElement().draggable( 'enable' );

				if ( self.slider.isAtStart() && !self.noMoreOlderRevisions ) {
					self.addOlderRevisionsIfNeeded( $( '.mw-revslider-revision-slider' ) );
				}
				if ( self.slider.isAtEnd() && !self.noMoreNewerRevisions ) {
					self.addNewerRevisionsIfNeeded( $( '.mw-revslider-revision-slider' ) );
				}

				self.resetRevisionStylesBasedOnPointerPosition(
					self.getRevisionsElement()
				);
			}
		);

		this.alignPointersAndLines( duration );
	},

	/**
	 * @private
	 * @return {number}
	 */
	getScrollLeft: function () {
		const scrollLeft = this.slider.getOldestVisibleRevisionIndex() * this.revisionWidth;
		// See https://github.com/othree/jquery.rtl-scroll-type for why we don't need anything else
		// anymore.
		return this.dir === 'rtl' ? -scrollLeft : scrollLeft;
	},

	/**
	 * Visually move pointers to the positions set and reset pointer- and slider-lines
	 *
	 * @private
	 * @param {number|string} [duration]
	 */
	alignPointersAndLines: function ( duration ) {
		const self = this;

		this.fadeOutPointerLines( true );

		this.pointerOlder.getView()
			.slideToSideOrPosition( this.slider, duration )
			.promise().done( () => {
				self.resetSliderLines();
				self.redrawPointerLines();
			} );
		this.pointerNewer.getView()
			.slideToSideOrPosition( this.slider, duration )
			.promise().done( () => {
				self.resetSliderLines();
				self.redrawPointerLines();
			} );
	},

	/**
	 * Returns the Pointer object that belongs to the passed element
	 *
	 * @private
	 * @param {jQuery} $e
	 * @return {Pointer}
	 */
	whichPointer: function ( $e ) {
		return $e.hasClass( 'mw-revslider-pointer-older' ) ? this.pointerOlder : this.pointerNewer;
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 */
	addNewerRevisionsIfNeeded: function ( $slider ) {
		const api = new RevisionSliderApi( mw.util.wikiScript( 'api' ) ),
			self = this,
			revisions = this.slider.getRevisionList().getRevisions(),
			revisionCount = utils.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth );
		if ( this.noMoreNewerRevisions || !this.slider.isAtEnd() ) {
			return;
		}
		api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
			startId: revisions[ revisions.length - 1 ].getId(),
			dir: 'newer',
			limit: revisionCount + 1,
			knownUserGenders: this.slider.getRevisionList().getUserGenders(),
			changeTags: this.slider.getRevisionList().getAvailableTags()
		} ).then( ( data ) => {
			const revs = data.revisions.slice( 1 );
			if ( revs.length === 0 ) {
				self.noMoreNewerRevisions = true;
				return;
			}

			self.addRevisionsAtEnd( $slider, revs );

			if ( !( 'continue' in data ) ) {
				self.noMoreNewerRevisions = true;
			}
		} );
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 */
	addOlderRevisionsIfNeeded: function ( $slider ) {
		const api = new RevisionSliderApi( mw.util.wikiScript( 'api' ) ),
			self = this,
			revisions = this.slider.getRevisionList().getRevisions(),
			revisionCount = utils.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth );
		let precedingRevisionSize = 0;
		if ( this.noMoreOlderRevisions || !this.slider.isAtStart() ) {
			return;
		}
		api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
			startId: revisions[ 0 ].getId(),
			dir: 'older',
			// fetch an extra revision if there are more older revision than the current "window",
			// this makes it possible to correctly set a size of the bar related to the oldest revision to add
			limit: revisionCount + 2,
			knownUserGenders: this.slider.getRevisionList().getUserGenders(),
			changeTags: this.slider.getRevisionList().getAvailableTags()
		} ).then( ( data ) => {
			let revs = data.revisions.slice( 1 ).reverse();
			if ( revs.length === 0 ) {
				self.noMoreOlderRevisions = true;
				return;
			}

			if ( revs.length === revisionCount + 1 ) {
				precedingRevisionSize = revs[ 0 ].size;
				revs = revs.slice( 1 );
			}
			self.addRevisionsAtStart( $slider, revs, precedingRevisionSize );

			if ( !( 'continue' in data ) ) {
				self.noMoreOlderRevisions = true;
			}
		} );
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 * @param {Array} revs
	 */
	addRevisionsAtEnd: function ( $slider, revs ) {
		const revPositionOffset = this.slider.getRevisionList().getLength(),
			$revisions = $slider.find( '.mw-revslider-revisions-container .mw-revslider-revisions' );

		this.slider.getRevisionList().push( makeRevisions( revs ) );

		// Pushed revisions have their relative sizes set correctly with regard to the last previously
		// loaded revision. This should be taken into account when rendering newly loaded revisions (tooltip)
		const revisionsToRender = this.slider.getRevisionList().slice( revPositionOffset );

		const $addedRevisions = new RevisionListView( revisionsToRender ).render( this.revisionWidth, revPositionOffset );
		this.addClickHandlerToRevisions( $addedRevisions );

		$addedRevisions.find( '.mw-revslider-revision-wrapper' ).each( function () {
			$revisions.append( $( this ) );
		} );

		if ( this.shouldExpandSlider( $slider ) ) {
			this.expandSlider( $slider );
		}

		this.getRevisionListView().adjustRevisionSizes( $slider );

		if ( !this.slider.isAtEnd() ) {
			this.forwardArrowButton.setDisabled( false );
		}
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 * @param {Array} revs
	 * @param {number} precedingRevisionSize optional size of the revision preceding the first of revs,
	 *                                        used to correctly determine first revision's relative size
	 */
	addRevisionsAtStart: function ( $slider, revs, precedingRevisionSize ) {
		const $revisions = $slider.find( '.mw-revslider-revisions-container .mw-revslider-revisions' );
		const $revisionContainer = $slider.find( '.mw-revslider-revisions-container' );
		let revisionStyleResetRequired = false;

		this.slider.getRevisionList().unshift( makeRevisions( revs ), precedingRevisionSize );

		$slider.find( '.mw-revslider-revision' ).each( function () {
			$( this ).attr( 'data-pos', parseInt( $( this ).attr( 'data-pos' ), 10 ) + revs.length );
		} );

		// Pushed (unshifted) revisions have their relative sizes set correctly with regard to the last previously
		// loaded revision. This should be taken into account when rendering newly loaded revisions (tooltip)
		const revisionsToRender = this.slider.getRevisionList().slice( 0, revs.length );

		const $addedRevisions = new RevisionListView( revisionsToRender ).render( this.revisionWidth );
		this.addClickHandlerToRevisions( $addedRevisions );

		if ( this.getOlderPointerPos() !== -1 ) {
			this.setOlderPointerPos( this.getOlderPointerPos() + revisionsToRender.getLength() );
		} else {
			// Special case: old revision has been previously not loaded, need to initialize correct position
			const $oldRevElement = this.getOldRevElement( $addedRevisions );
			if ( $oldRevElement.length !== 0 ) {
				this.setOlderPointerPos( +$oldRevElement.attr( 'data-pos' ) );
				revisionStyleResetRequired = true;
			}

		}
		this.setNewerPointerPos( this.getNewerPointerPos() + revisionsToRender.getLength() );

		$( $addedRevisions.find( '.mw-revslider-revision-wrapper' ).get().reverse() ).each( function () { // TODO: this is horrible
			$revisions.prepend( $( this ) );
		} );

		if ( revisionStyleResetRequired ) {
			this.resetRevisionStylesBasedOnPointerPosition( $slider );
		}

		this.slider.setFirstVisibleRevisionIndex( this.slider.getOldestVisibleRevisionIndex() + revisionsToRender.getLength() );

		const revIdOld = +this.getRevElementAtPosition( $revisions, this.getOlderPointerPos() ).attr( 'data-revid' );
		const revIdNew = +this.getRevElementAtPosition( $revisions, this.getNewerPointerPos() ).attr( 'data-revid' );
		this.diffPage.replaceState( revIdNew, revIdOld, this );

		$revisionContainer.scrollLeft( this.getScrollLeft() );

		if ( this.shouldExpandSlider( $slider ) ) {
			this.expandSlider( $slider );
		}

		this.getRevisionListView().adjustRevisionSizes( $slider );

		this.backwardArrowButton.setDisabled( false );
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 * @return {boolean}
	 */
	shouldExpandSlider: function ( $slider ) {
		const sliderWidth = $slider.width(),
			maxAvailableWidth = this.calculateSliderContainerWidth() + this.containerMargin;

		return !( this.noMoreNewerRevisions && this.noMoreOlderRevisions ) && sliderWidth < maxAvailableWidth;
	},

	/**
	 * @private
	 * @param {jQuery} $slider
	 */
	expandSlider: function ( $slider ) {
		const containerWidth = this.calculateSliderContainerWidth();

		$slider.css( { width: ( containerWidth + this.containerMargin ) + 'px' } );
		$slider.find( '.mw-revslider-revisions-container' ).css( { width: containerWidth + 'px' } );
		$slider.find( '.mw-revslider-pointer-container' ).css( { width: containerWidth + this.revisionWidth - 1 + 'px' } );

		const expandedRevisionWindowCapacity = $slider.find( '.mw-revslider-revisions-container' ).width() / this.revisionWidth;
		this.slider.setRevisionsPerWindow( expandedRevisionWindowCapacity );

		this.slideView( Math.floor( ( this.getNewerPointerPos() - 1 ) / expandedRevisionWindowCapacity ), 0 );
	},

	/**
	 * @private
	 * @return {RevisionListView}
	 */
	getRevisionListView: function () {
		return this.slider.getRevisionList().getView();
	},

	/**
	 * @private
	 * @return {jQuery}
	 */
	getRevisionsElement: function () {
		return this.getRevisionListView().getElement();
	}
} );

module.exports = SliderView;
