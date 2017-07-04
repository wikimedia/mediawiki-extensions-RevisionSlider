( function ( mw, $ ) {
	/**
	 * Module handling the view logic of the RevisionSlider slider
	 *
	 * @param {Slider} slider
	 * @constructor
	 */
	var SliderView = function ( slider ) {
		this.slider = slider;
		this.diffPage = new mw.libs.revisionSlider.DiffPage( this.slider.getRevisions() );
	};

	$.extend( SliderView.prototype, {
		revisionWidth: 16,

		containerMargin: 140,

		outerMargin: 20,

		/**
		 * @type {jQuery}
		 */
		$element: null,

		/**
		 * @type {DiffPage}
		 */
		diffPage: null,

		/**
		 * @type {Slider}
		 */
		slider: null,

		/**
		 * @type {Pointer}
		 */
		pointerOlder: null,

		/**
		 * @type {Pointer}
		 */
		pointerNewer: null,

		/**
		 * @type {OO.ui.ButtonWidget}
		 */
		backwardArrowButton: null,

		/**
		 * @type {OO.ui.ButtonWidget}
		 */
		forwardArrowButton: null,

		/**
		 * @type {string}
		 *
		 * Value of scrollLeft property when in RTL mode varies between browser. This identifies
		 * an implementation used by user's browser:
		 * - 'default': 0 is the left-most position, values increase when scrolling right (same as scrolling from left to right in LTR mode)
		 * - 'negative': 0 is right-most position, values decrease when scrolling left (ie. all values except 0 are negative)
		 * - 'reverse': 0 is right-most position, values incrase when scrolling left
		 */
		rtlScrollLeftType: 'default',

		/**
		 * @type {boolean}
		 */
		noMoreNewerRevisions: false,

		/**
		 * @type {boolean}
		 */
		noMoreOlderRevisions: false,

		/**
		 * @type {string}
		 */
		dir: null,

		/**
		 * @type {boolean}
		 */
		isDragged: false,

		escapePressed: false,

		render: function ( $container ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				sliderArrowView = new mw.libs.revisionSlider.SliderArrowView( this ),
				self = this;

			this.dir = $container.css( 'direction' ) || 'ltr';

			if ( this.dir === 'rtl' ) {
				this.rtlScrollLeftType = this.determineRtlScrollType();
			}

			this.pointerOlder = this.pointerOlder || new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-older' );
			this.pointerNewer = this.pointerNewer || new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-newer' );

			this.backwardArrowButton = sliderArrowView.renderBackwardArrow();
			this.forwardArrowButton = sliderArrowView.renderForwardArrow();

			this.$element = $( '<div>' )
				.addClass( 'mw-revslider-revision-slider' )
				.css( {
					direction: $container.css( 'direction' ),
					width: ( containerWidth + this.containerMargin ) + 'px'
				} )
				.append(
					this.backwardArrowButton.$element,
					this.renderRevisionsContainer( containerWidth, $revisions ),
					this.forwardArrowButton.$element,
					mw.libs.revisionSlider.HelpButtonView.render(),
					$( '<div>' ).css( { clear: 'both' } ),
					this.renderPointerContainer( containerWidth ),
					this.pointerOlder.getLine().render(), this.pointerNewer.getLine().render()
				);

			this.initPointers( $revisions );

			this.$element.find( '.mw-revslider-revision-wrapper' ).on( 'click', null, { view: self, revisionsDom: $revisions }, this.revisionWrapperClickHandler );

			this.slider.setRevisionsPerWindow( this.$element.find( '.mw-revslider-revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );

			$container.html( this.$element );

			this.slide( Math.floor( ( this.pointerNewer.getPosition() - 1 ) / this.slider.getRevisionsPerWindow() ), 0 );
			this.diffPage.addHandlersToCoreLinks( this );
			this.diffPage.replaceState( mw.config.get( 'extRevisionSliderNewRev' ), mw.config.get( 'extRevisionSliderOldRev' ), this );
			this.diffPage.initOnPopState( this );
		},

		/**
		 * Renders the revisions container and adds the revisions to it
		 *
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
		 * @param {number} containerWidth
		 * @return {jQuery} the pointer container
		 */
		renderPointerContainer: function ( containerWidth ) {
			var pointerContainerPosition = 53,
				pointerContainerWidth = containerWidth + this.revisionWidth - 1,
				pointerContainerStyle, lastMouseMoveRevisionPos,
				self = this;

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
				.mousemove( function ( event ) {
					if ( !self.isDragged ) {
						lastMouseMoveRevisionPos = self.showTooltipsOnMouseMoveHandler(
							event,
							lastMouseMoveRevisionPos
						);
					}
				} );
		},

		renderPointerContainers: function () {
			var self = this;

			return [
				$( '<div>' )
					.addClass( 'mw-revslider-pointer-container-newer' )
					.click( function ( event ) {
						self.sliderLineClickHandler( event, $( this ) );
					} )
					.append(
						$( '<div>' ).addClass( 'mw-revslider-slider-line' ),
						this.pointerNewer.getView().render()
					),
				$( '<div>' )
					.addClass( 'mw-revslider-pointer-container-older' )
					.click( function ( event ) {
						self.sliderLineClickHandler( event, $( this ) );
					} )
					.append(
						$( '<div>' ).addClass( 'mw-revslider-slider-line' ),
						this.pointerOlder.getView().render()
					)
			];
		},

		/**
		 * Initializes the pointer dragging logic
		 *
		 * @param {jQuery} $revisions
		 */
		initPointers: function ( $revisions ) {
			var $pointers,
				$pointerOlder = this.pointerOlder.getView().getElement(),
				$pointerNewer = this.pointerNewer.getView().getElement(),
				self = this;

			$pointers = this.$element.find( '.mw-revslider-pointer' );

			$( 'body' ).keydown( function ( e ) {
				if ( e.which === 27 ) {
					self.escapePressed = true;
					$pointers.trigger( 'mouseup' );
				}
			} );

			$pointerOlder.draggable( this.buildDraggableOptions(
				$revisions,
				'.mw-revslider-pointer-container-older'
			) );
			$pointerNewer.draggable( this.buildDraggableOptions(
				$revisions,
				'.mw-revslider-pointer-container-newer'
			) );

			$pointerNewer
				.on(
					'touchstart touchmove touchend touchcancel touchleave',
					mw.libs.revisionSlider.touchEventConverter
				)
				.addClass( 'mw-revslider-pointer-newid mw-revslider-pointer-upper' );
			$pointerOlder
				.on(
					'touchstart touchmove touchend touchcancel touchleave',
					mw.libs.revisionSlider.touchEventConverter
				)
				.addClass( 'mw-revslider-pointer-oldid mw-revslider-pointer-lower' );
		},

		showTooltipsOnMouseMoveHandler: function ( event, lastValidPosition ) {
			var pos = this.getRevisionPositionFromLeftOffset( event.pageX ),
				$hoveredRevisionWrapper;

			if ( pos === lastValidPosition ) {
				return pos;
			}

			$hoveredRevisionWrapper = this.getRevElementAtPosition( this.getRevisionsElement(), pos ).parent();
			this.slider.getRevisions().getView().showTooltip( $hoveredRevisionWrapper );

			return pos;
		},

		sliderLineClickHandler: function ( event, $line ) {
			var pos = this.getRevisionPositionFromLeftOffset( event.pageX ),
				$clickedRev, pointerMoved, pointerOther, $revisions;

			if ( $line.hasClass( 'mw-revslider-pointer-container-newer' ) ) {
				pointerMoved = this.pointerNewer;
				pointerOther = this.pointerOlder;
			} else {
				pointerMoved = this.pointerOlder;
				pointerOther = this.pointerNewer;
			}

			if ( pos === pointerOther.getPosition() ) {
				return;
			}

			$revisions = this.getRevisionsElement();
			$clickedRev = this.getRevElementAtPosition( $revisions, pos );

			pointerMoved.setPosition( pos );
			this.updatePointerPositionAttributes();
			if ( $line.hasClass( 'mw-revslider-pointer-container-newer' ) ) {
				this.refreshRevisions(
					$clickedRev.attr( 'data-revid' ),
					this.getRevElementAtPosition( $revisions, pointerOther.getPosition() ).attr( 'data-revid' )
				);
			} else {
				this.refreshRevisions(
					this.getRevElementAtPosition( $revisions, pointerOther.getPosition() ).attr( 'data-revid' ),
					$clickedRev.attr( 'data-revid' )
				);
			}
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );
			this.alignPointers();
		},

		/**
		 * Build options for the draggable
		 *
		 * @param {jQuery} $revisions
		 * @param {string} containmentClass
		 * @return {Object}
		 */
		buildDraggableOptions: function ( $revisions, containmentClass ) {
			var lastValidLeftPos,
				self = this;

			return {
				axis: 'x',
				grid: [ this.revisionWidth, null ],
				containment: containmentClass,
				start: function () {
					self.isDragged = true;
					self.setPointerDragCursor();
					self.fadeOutPointerLines();
					self.escapePressed = false;
				},
				stop: function () {
					var $p = $( this ),
						relativeIndex = self.getRelativePointerIndex( $p ),
						pointer = self.whichPointer( $p ),
						diff, oldid;

					self.isDragged = false;
					self.removePointerDragCursor();

					if ( self.escapePressed ) {
						self.updatePointerPositionAttributes();
						self.resetSliderLines();
						return;
					}

					mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );
					pointer.setPosition( self.slider.getOldestVisibleRevisionIndex() + relativeIndex );
					self.updatePointerPositionAttributes();
					self.resetSliderLines();
					self.resetRevisionStylesBasedOnPointerPosition( $revisions );

					diff = self.getRevElementAtPosition(
						$revisions, self.pointerNewer.getPosition()
					).data( 'revid' );

					oldid = self.getRevElementAtPosition(
						$revisions, self.pointerOlder.getPosition()
					).data( 'revid' );

					self.refreshRevisions( diff, oldid );

					self.redrawPointerLines();
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

		draggableDragAction: function ( event, ui, pointer, lastValidLeftPos ) {
			var pos, $revisions, $hoveredRevisionWrapper;

			pos = this.getRevisionPositionFromLeftOffset(
				$( pointer ).offset().left + this.revisionWidth / 2
			);

			if ( pos === lastValidLeftPos ) {
				return pos;
			}

			$revisions = this.getRevisionsElement();
			$hoveredRevisionWrapper = this.getRevElementAtPosition( $revisions, pos ).parent();
			this.slider.getRevisions().getView().showTooltip( $hoveredRevisionWrapper );

			return pos;
		},

		getRevisionPositionFromLeftOffset: function ( leftOffset ) {
			var $revisions = this.getRevisionsElement(),
				revisionsX = mw.libs.revisionSlider.correctElementOffsets( $revisions.offset() ).left,
				pos = Math.ceil( Math.abs( leftOffset - revisionsX ) / this.revisionWidth );

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

		setPointerDragCursor: function () {
			$( '.mw-revslider-pointer, ' +
				'.mw-revslider-pointer-container, ' +
				'.mw-revslider-pointer-container-newer, ' +
				'.mw-revslider-pointer-container-older, ' +
				'.mw-revslider-pointer-line, ' +
				'.mw-revslider-revision-wrapper' )
				.addClass( 'mw-revslider-pointer-grabbing' );
		},

		removePointerDragCursor: function () {
			$( '.mw-revslider-pointer, ' +
				'.mw-revslider-pointer-container, ' +
				'.mw-revslider-pointer-container-newer, ' +
				'.mw-revslider-pointer-container-older, ' +
				'.mw-revslider-pointer-line, ' +
				'.mw-revslider-revision-wrapper' )
				.removeClass( 'mw-revslider-pointer-grabbing' );
		},

		/**
		 * Get the relative index for a pointer.
		 *
		 * @param {jQuery} $pointer
		 * @return {number}
		 */
		getRelativePointerIndex: function ( $pointer ) {
			var pos = $pointer.position().left,
				pointer = this.whichPointer( $pointer );

			if ( this.dir === 'rtl' ) {
				pos = pointer.getView().getAdjustedLeftPositionWhenRtl( pos );
			}
			return Math.ceil( ( pos + this.revisionWidth / 2 ) / this.revisionWidth );
		},

		getNewestVisibleRevisonLeftPos: function () {
			return $( '.mw-revslider-revisions-container' ).width() - this.revisionWidth;
		},

		revisionWrapperClickHandler: function ( e ) {
			var pClicked, pOther,
				$revWrap = $( this ),
				view = e.data.view,
				$revisions = e.data.revisionsDom,
				$clickedRev = $revWrap.find( '.mw-revslider-revision' ),
				hasClickedTop = e.pageY - $revWrap.offset().top < $revWrap.height() / 2,
				pOld = view.getOldRevPointer(),
				pNew = view.getNewRevPointer(),
				targetPos = +$clickedRev.attr( 'data-pos' );

			pClicked = hasClickedTop ? pNew : pOld;
			pOther = hasClickedTop ? pOld : pNew;

			if ( targetPos === pOther.getPosition() ) {
				return false;
			}
			pClicked.setPosition( targetPos );
			view.updatePointerPositionAttributes();

			if ( hasClickedTop ) {
				view.refreshRevisions(
					+$clickedRev.data( 'revid' ),
					+view.getRevElementAtPosition( $revisions, pOther.getPosition() ).data( 'revid' )
				);
			} else {
				view.refreshRevisions(
					+view.getRevElementAtPosition( $revisions, pOther.getPosition() ).data( 'revid' ),
					+$clickedRev.data( 'revid' )
				);
			}

			view.resetRevisionStylesBasedOnPointerPosition( $revisions );
			view.alignPointers();
		},

		/**
		 * Returns the pointer that points to the older revision
		 *
		 * @return {Pointer}
		 */
		getOldRevPointer: function () {
			return this.pointerOlder.getPosition() <= this.pointerNewer.getPosition() ? this.pointerOlder : this.pointerNewer;
		},

		/**
		 * Returns the pointer that points to the newer revision
		 *
		 * @return {Pointer}
		 */
		getNewRevPointer: function () {
			return this.pointerOlder.getPosition() > this.pointerNewer.getPosition() ? this.pointerOlder : this.pointerNewer;
		},

		/**
		 * Refreshes the diff page to show the diff for the specified revisions
		 *
		 * @param {number} diff
		 * @param {number} oldid
		 */
		refreshRevisions: function ( diff, oldid ) {
			this.diffPage.refresh( diff, oldid, this );
			this.diffPage.pushState( diff, oldid, this );
		},

		showNextDiff: function () {
			this.pointerOlder.setPosition( this.pointerNewer.getPosition() );
			this.pointerNewer.setPosition( this.pointerNewer.getPosition() + 1 );
			this.resetAndRefreshRevisions();
		},

		showPrevDiff: function () {
			this.pointerNewer.setPosition( this.pointerOlder.getPosition() );
			this.pointerOlder.setPosition( this.pointerOlder.getPosition() - 1 );
			this.resetAndRefreshRevisions();
		},

		resetAndRefreshRevisions: function () {
			this.slide( 0 );
			this.resetSliderLines();
			this.resetRevisionStylesBasedOnPointerPosition(
				this.$element.find( 'div.mw-revslider-revisions' )
			);
			this.updatePointerPositionAttributes();
			this.refreshRevisions(
				$( '.mw-revslider-revision[data-pos="' + this.pointerNewer.getPosition() + '"]' ).attr( 'data-revid' ),
				$( '.mw-revslider-revision[data-pos="' + this.pointerOlder.getPosition() + '"]' ).attr( 'data-revid' )
			);
		},

		/**
		 * @param {jQuery} $revs
		 * @param {number} pos
		 * @return {jQuery}
		 */
		getRevElementAtPosition: function ( $revs, pos ) {
			return $revs.find( 'div.mw-revslider-revision[data-pos="' + pos + '"]' );
		},

		/**
		 * Gets the jQuery element of the older selected revision
		 *
		 * @param {jQuery} $revs
		 * @return {jQuery}
		 */
		getOldRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revslider-revision[data-revid="' + mw.config.get( 'extRevisionSliderOldRev' ) + '"]' );
		},

		/**
		 * Gets the jQuery element of the newer selected revision
		 *
		 * @param {jQuery} $revs
		 * @return {jQuery}
		 */
		getNewRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revslider-revision[data-revid="' + mw.config.get( 'extRevisionSliderNewRev' ) + '"]' );
		},

		/**
		 * Initializes the Pointer objects based on the selected revisions
		 *
		 * @param {jQuery} $oldRevElement
		 * @param {jQuery} $newRevElement
		 */
		initializePointers: function ( $oldRevElement, $newRevElement ) {
			if ( this.pointerOlder.getPosition() !== 0 || this.pointerNewer.getPosition() !== 0 ) {
				return;
			}
			if ( $oldRevElement.length === 0 && $newRevElement.length === 0 ) {
				// Note: this is currently caught in init.js
				throw new Error( 'RS-revs-not-specified' );
			}
			if ( $oldRevElement.length !== 0 ) {
				this.pointerOlder.setPosition( $oldRevElement.data( 'pos' ) );
			} else {
				this.pointerOlder.setPosition( -1 );
			}
			this.pointerNewer.setPosition( $newRevElement.data( 'pos' ) );
			this.resetSliderLines();
			this.updatePointerPositionAttributes();
		},

		/**
		 * Resets the slider lines based on the selected revisions
		 */
		resetSliderLines: function () {
			this.updateOlderSliderLineCSS();
			this.updateNewerSliderLineCSS();
		},

		updateOlderSliderLineCSS: function () {
			var widthToSet = ( this.getOlderDistanceToOldest() + this.getDistanceBetweenPointers() ) *
					this.revisionWidth,
				marginToSet = -this.revisionWidth / 2;

			widthToSet = Math.min( widthToSet, this.calculateSliderContainerWidth() + this.revisionWidth );

			this.setSliderLineCSS(
				$( '.mw-revslider-pointer-container-older' ), widthToSet, marginToSet
			);
		},

		updateNewerSliderLineCSS: function () {
			var widthToSet = ( this.getNewerDistanceToNewest() + this.getDistanceBetweenPointers() + 2 ) *
					this.revisionWidth,
				marginToSet = ( this.getOlderDistanceToOldest() * this.revisionWidth ) -
					this.revisionWidth / 2;

			widthToSet = Math.min( widthToSet, this.calculateSliderContainerWidth() + this.revisionWidth );
			marginToSet = Math.max( marginToSet, -0.5 * this.revisionWidth );

			this.setSliderLineCSS(
				$( '.mw-revslider-pointer-container-newer' ), widthToSet, marginToSet
			);
		},

		setSliderLineCSS: function ( $lineContainer, widthToSet, marginToSet ) {
			if ( this.dir === 'ltr' ) {
				$lineContainer.css( {
					width: widthToSet,
					'margin-left': marginToSet
				} );
			} else {
				$lineContainer.css( {
					width: widthToSet,
					'margin-right': marginToSet + this.revisionWidth
				} );
			}
		},

		getOlderDistanceToOldest: function () {
			return this.pointerOlder.getPosition() - this.slider.getOldestVisibleRevisionIndex();
		},

		getNewerDistanceToNewest: function () {
			return this.slider.getNewestVisibleRevisionIndex() - this.pointerNewer.getPosition();
		},

		getDistanceBetweenPointers: function () {
			return this.pointerNewer.getPosition() - this.pointerOlder.getPosition();
		},

		/**
		 * Highlights revisions between the pointers
		 *
		 * @param {jQuery} $revisions
		 */
		resetRevisionStylesBasedOnPointerPosition: function ( $revisions ) {
			var olderRevPosition = this.getOldRevPointer().getPosition(),
				newerRevPosition = this.getNewRevPointer().getPosition(),
				positionIndex = olderRevPosition + 1;

			$revisions.find( 'div.mw-revslider-revision' )
				.removeClass( 'mw-revslider-revision-intermediate mw-revslider-revision-old mw-revslider-revision-new' );

			this.getRevElementAtPosition( $revisions, olderRevPosition ).addClass( 'mw-revslider-revision-old' );
			this.getRevElementAtPosition( $revisions, newerRevPosition ).addClass( 'mw-revslider-revision-new' );
			while ( positionIndex < newerRevPosition ) {
				this.getRevElementAtPosition( $revisions, positionIndex ).addClass( 'mw-revslider-revision-intermediate' );
				positionIndex++;
			}
		},

		/**
		 * Updates value of pointers' position data attribute
		 */
		updatePointerPositionAttributes: function () {
			this.getNewRevPointer().getView().getElement().attr(
				'data-pos',
				this.getNewRevPointer().getPosition()
			);

			this.getOldRevPointer().getView().getElement().attr(
				'data-pos',
				this.getOldRevPointer().getPosition()
			);
		},

		/**
		 * Redraws the lines for the pointers
		 */
		redrawPointerLines: function () {
			this.fadeInPointerLines();
			$( '.mw-revslider-pointer-line-upper, .mw-revslider-pointer-line-lower' )
				.removeClass( 'mw-revslider-bottom-line mw-revslider-left-line mw-revslider-right-line' );
			this.pointerOlder.getLine().drawLine();
			this.pointerNewer.getLine().drawLine();
		},

		/**
		 * Fades out the lines for the pointers
		 */
		fadeOutPointerLines: function () {
			$( '.mw-revslider-pointer-line' ).fadeTo( 0, 0.3 );
		},

		/**
		 * Fades in the lines for the pointers
		 */
		fadeInPointerLines: function () {
			$( '.mw-revslider-pointer-line' ).fadeTo( 0, 1 );
		},

		/**
		 * @return {number}
		 */
		calculateSliderContainerWidth: function () {
			return Math.min(
					this.slider.getRevisions().getLength(),
					mw.libs.revisionSlider.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth )
				) * this.revisionWidth;
		},

		slide: function ( direction, duration ) {
			var animateObj,
				$animatedElement = this.$element.find( '.mw-revslider-revisions-container' ),
				self = this;

			this.slider.slide( direction );
			this.pointerOlder.getView().getElement().draggable( 'disable' );
			this.pointerNewer.getView().getElement().draggable( 'disable' );

			if ( this.slider.isAtStart() ) {
				this.backwardArrowButton.setDisabled( true );
			} else {
				this.backwardArrowButton.setDisabled( false );
			}
			if ( this.slider.isAtEnd() ) {
				this.forwardArrowButton.setDisabled( true );
			} else {
				this.forwardArrowButton.setDisabled( false );
			}

			animateObj = { scrollLeft: this.slider.getOldestVisibleRevisionIndex() * this.revisionWidth };
			if ( this.dir === 'rtl' ) {
				animateObj.scrollLeft = this.getRtlScrollLeft( $animatedElement, animateObj.scrollLeft );
			}

			$animatedElement.animate(
				animateObj,
				duration,
				null,
				function () {
					self.pointerOlder.getView().getElement().draggable( 'enable' );
					self.pointerNewer.getView().getElement().draggable( 'enable' );

					if ( self.slider.isAtStart() && !self.noMoreOlderRevisions ) {
						self.addOlderRevisionsIfNeeded( $( '.mw-revslider-revision-slider' ) );
					}
					if ( self.slider.isAtEnd() && !self.noMoreNewerRevisions ) {
						self.addNewerRevisionsIfNeeded( $( '.mw-revslider-revision-slider' ) );
					}
				}
			);

			this.alignPointers( duration );
		},

		/**
		 * Based on jQuery RTL Scroll Type Detector plugin by othree: https://github.com/othree/jquery.rtl-scroll-type
		 *
		 * @return {string} - 'default', 'negative' or 'reverse'
		 */
		determineRtlScrollType: function () {
			var isChrome = /chrom(e|ium)/.test( navigator.userAgent.toLowerCase() ),
				$dummy;

			// in Chrome V8 5.8.283 and 5.9.211 the detection below gives wrong results leading to strange behavior
			// Chrome V8 6.0 seems to fix that issue so this workaround can be removed then
			if ( isChrome ) {
				return 'default';
			}

			$dummy = $( '<div>' )
				.css( {
					dir: 'rtl',
					width: '1px',
					height: '1px',
					position: 'absolute',
					top: '-1000px',
					overflow: 'scroll'
				} )
				.text( 'A' )
				.appendTo( 'body' )[ 0 ];
			if ( $dummy.scrollLeft > 0 ) {
				return 'default';
			} else {
				$dummy.scrollLeft = 1;
				if ( $dummy.scrollLeft === 0 ) {
					return 'negative';
				}
			}
			return 'reverse';
		},

		/**
		 * @param {jQuery} $element
		 * @param {number} scrollLeft
		 * @return {number}
		 */
		getRtlScrollLeft: function ( $element, scrollLeft ) {
			if ( this.rtlScrollLeftType === 'reverse' ) {
				return scrollLeft;
			}
			if ( this.rtlScrollLeftType === 'negative' ) {
				return -scrollLeft;
			}
			return $element.prop( 'scrollWidth' ) - $element.width() - scrollLeft;
		},

		alignPointers: function ( duration ) {
			var self = this;

			this.fadeOutPointerLines();

			this.pointerOlder.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetSliderLines();
					self.redrawPointerLines();
				} );
			this.pointerNewer.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetSliderLines();
					self.redrawPointerLines();
				} );
		},

		/**
		 * Returns the Pointer object that belongs to the passed element
		 *
		 * @param {jQuery} $e
		 * @return {Pointer}
		 */
		whichPointer: function ( $e ) {
			return $e.hasClass( 'mw-revslider-pointer-older' ) ? this.pointerOlder : this.pointerNewer;
		},

		/**
		 * @param {jQuery} $slider
		 */
		addNewerRevisionsIfNeeded: function ( $slider ) {
			var api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) ),
				self = this,
				revisions = this.slider.getRevisions().getRevisions(),
				revisionCount = mw.libs.revisionSlider.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth ),
				revs;
			if ( this.noMoreNewerRevisions || !this.slider.isAtEnd() ) {
				return;
			}
			api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
				startId: revisions[ revisions.length - 1 ].getId(),
				dir: 'newer',
				limit: revisionCount + 1,
				knownUserGenders: this.slider.getRevisions().getUserGenders()
			} ).then( function ( data ) {
				revs = data.revisions.slice( 1 );
				if ( revs.length === 0 ) {
					self.noMoreNewerRevisions = true;
					return;
				}

				self.addRevisionsAtEnd( $slider, revs );

				if ( data.continue === undefined ) {
					self.noMoreNewerRevisions = true;
				}
			} );
		},

		/**
		 * @param {jQuery} $slider
		 */
		addOlderRevisionsIfNeeded: function ( $slider ) {
			var api = new mw.libs.revisionSlider.Api( mw.util.wikiScript( 'api' ) ),
				self = this,
				revisions = this.slider.getRevisions().getRevisions(),
				revisionCount = mw.libs.revisionSlider.calculateRevisionsPerWindow( this.containerMargin + this.outerMargin, this.revisionWidth ),
				revs,
				precedingRevisionSize = 0;
			if ( this.noMoreOlderRevisions || !this.slider.isAtStart() ) {
				return;
			}
			api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
				startId: revisions[ 0 ].getId(),
				dir: 'older',
				// fetch an extra revision if there are more older revision than the current "window",
				// this makes it possible to correctly set a size of the bar related to the oldest revision to add
				limit: revisionCount + 2,
				knownUserGenders: this.slider.getRevisions().getUserGenders()
			} ).then( function ( data ) {
				revs = data.revisions.slice( 1 ).reverse();
				if ( revs.length === 0 ) {
					self.noMoreOlderRevisions = true;
					return;
				}

				if ( revs.length === revisionCount + 1 ) {
					precedingRevisionSize = revs[ 0 ].size;
					revs = revs.slice( 1 );
				}
				self.addRevisionsAtStart( $slider, revs, precedingRevisionSize );

				if ( data.continue === undefined ) {
					self.noMoreOlderRevisions = true;
				}
			} );
		},

		/**
		 * @param {jQuery} $slider
		 * @param {Array} revs
		 */
		addRevisionsAtEnd: function ( $slider, revs ) {
			var revPositionOffset = this.slider.getRevisions().getLength(),
				$revisions = $slider.find( '.mw-revslider-revisions-container .mw-revslider-revisions' ),
				revisionsToRender,
				$addedRevisions;

			this.slider.getRevisions().push( mw.libs.revisionSlider.makeRevisions( revs ) );

			// Pushed revisions have their relative sizes set correctly with regard to the last previously
			// loaded revision. This should be taken into account when rendering newly loaded revisions (tooltip)
			revisionsToRender = this.slider.getRevisions().slice( revPositionOffset );

			$addedRevisions = new mw.libs.revisionSlider.RevisionListView( revisionsToRender, this.dir ).render( this.revisionWidth, revPositionOffset );

			this.addClickHandlerToRevisions( $addedRevisions, $revisions, this.revisionWrapperClickHandler );

			$addedRevisions.find( '.mw-revslider-revision-wrapper' ).each( function () {
				$revisions.append( $( this ) );
			} );

			if ( this.shouldExpandSlider( $slider ) ) {
				this.expandSlider( $slider );
			}

			this.slider.getRevisions().getView().adjustRevisionSizes( $slider );

			if ( !this.slider.isAtEnd() ) {
				this.forwardArrowButton.setDisabled( false );
			}
		},

		/**
		 * @param {jQuery} $slider
		 * @param {Array} revs
		 * @param {number} precedingRevisionSize optional size of the revision preceding the first of revs,
		 *                                        used to correctly determine first revision's relative size
		 */
		addRevisionsAtStart: function ( $slider, revs, precedingRevisionSize ) {
			var self = this,
				$revisions = $slider.find( '.mw-revslider-revisions-container .mw-revslider-revisions' ),
				$revisionContainer = $slider.find( '.mw-revslider-revisions-container' ),
				revisionsToRender,
				$addedRevisions,
				pOld, pNew,
				revIdOld, revIdNew,
				revisionStyleResetRequired = false,
				$oldRevElement,
				scrollLeft;

			this.slider.getRevisions().unshift( mw.libs.revisionSlider.makeRevisions( revs ), precedingRevisionSize );

			$slider.find( '.mw-revslider-revision' ).each( function () {
				$( this ).attr( 'data-pos', parseInt( $( this ).attr( 'data-pos' ), 10 ) + revs.length );
			} );

			// Pushed (unshifted) revisions have their relative sizes set correctly with regard to the last previously
			// loaded revision. This should be taken into account when rendering newly loaded revisions (tooltip)
			revisionsToRender = this.slider.getRevisions().slice( 0, revs.length );

			$addedRevisions = new mw.libs.revisionSlider.RevisionListView( revisionsToRender, this.dir ).render( this.revisionWidth );

			pOld = this.getOldRevPointer();
			pNew = this.getNewRevPointer();

			if ( pOld.getPosition() !== -1 ) {
				pOld.setPosition( pOld.getPosition() + revisionsToRender.getLength() );
			} else {
				// Special case: old revision has been previously not loaded, need to initialize correct position
				$oldRevElement = this.getOldRevElement( $addedRevisions );
				if ( $oldRevElement.length !== 0 ) {
					pOld.setPosition( $oldRevElement.data( 'pos' ) );
					revisionStyleResetRequired = true;
				}

			}
			pNew.setPosition( pNew.getPosition() + revisionsToRender.getLength() );

			this.addClickHandlerToRevisions( $addedRevisions, $revisions, this.revisionWrapperClickHandler );

			$( $addedRevisions.find( '.mw-revslider-revision-wrapper' ).get().reverse() ).each( function () { // TODO: this is horrible
				$revisions.prepend( $( this ) );
			} );

			if ( revisionStyleResetRequired ) {
				this.resetRevisionStylesBasedOnPointerPosition( $slider );
			}

			this.slider.setFirstVisibleRevisionIndex( this.slider.getOldestVisibleRevisionIndex() + revisionsToRender.getLength() );

			revIdOld = self.getRevElementAtPosition( $revisions, pOld.getPosition() ).data( 'revid' );
			revIdNew = self.getRevElementAtPosition( $revisions, pNew.getPosition() ).data( 'revid' );
			this.diffPage.replaceState( revIdNew, revIdOld, this );

			scrollLeft = this.slider.getOldestVisibleRevisionIndex() * this.revisionWidth;
			$revisionContainer.scrollLeft( scrollLeft );
			if ( this.dir === 'rtl' ) {
				$revisionContainer.scrollLeft( self.getRtlScrollLeft( $revisionContainer, scrollLeft ) );
			}

			if ( this.shouldExpandSlider( $slider ) ) {
				this.expandSlider( $slider );
			}

			this.slider.getRevisions().getView().adjustRevisionSizes( $slider );

			this.backwardArrowButton.setDisabled( false );
		},

		/**
		 * @param {jQuery} $revisions
		 * @param {jQuery} $allRevisions
		 * @param {Function} clickHandler
		 */
		addClickHandlerToRevisions: function ( $revisions, $allRevisions, clickHandler ) {
			var self = this;
			$revisions.find( '.mw-revslider-revision-wrapper' ).on(
				'click',
				null,
				{ view: self, revisionsDom: $allRevisions },
				clickHandler
			);
		},

		/**
		 * @param {jQuery} $slider
		 * @return {boolean}
		 */
		shouldExpandSlider: function ( $slider ) {
			var sliderWidth = $slider.width(),
				maxAvailableWidth = this.calculateSliderContainerWidth() + this.containerMargin;

			return !( this.noMoreNewerRevisions && this.noMoreOlderRevisions ) && sliderWidth < maxAvailableWidth;
		},

		/**
		 * @param {jQuery} $slider
		 */
		expandSlider: function ( $slider ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				expandedRevisionWindowCapacity;

			$slider.css( { width: ( containerWidth + this.containerMargin ) + 'px' } );
			$slider.find( '.mw-revslider-revisions-container' ).css( { width: containerWidth + 'px' } );
			$slider.find( '.mw-revslider-pointer-container' ).css( { width: containerWidth + this.revisionWidth - 1 + 'px' } );

			expandedRevisionWindowCapacity = $slider.find( '.mw-revslider-revisions-container' ).width() / this.revisionWidth;
			this.slider.setRevisionsPerWindow( expandedRevisionWindowCapacity );

			this.slide( Math.floor( ( this.pointerNewer.getPosition() - 1 ) / expandedRevisionWindowCapacity ), 0 );
		},

		/**
		 * @return {jQuery}
		 */
		getRevisionsElement: function () {
			return this.slider.getRevisions().getView().getElement();
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
