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
			this.diffPage.replaceState( mw.config.get( 'extRevisionSliderOldRev' ), mw.config.get( 'extRevisionSliderNewRev' ), this );
			this.diffPage.initOnPopState( this );
		},

		/**
		 * Renders the revisions container and adds the revisions to it
		 *
		 * @param {number} containerWidth
		 * @param {jQuery} $revisions
		 * @return {jQuery} the revisions container
		 */
		renderRevisionsContainer: function( containerWidth, $revisions ) {
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
		renderPointerContainer: function( containerWidth ) {
			var pointerContainerPosition = 53,
				pointerContainerWidth = containerWidth + this.revisionWidth - 1,
				pointerContainerStyle;

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
				.append( this.pointerOlder.getView().render(), this.pointerNewer.getView().render() );
		},

		/**
		 * Initializes the pointer dragging logic
		 *
		 * @param {jQuery} $revisions
		 */
		initPointers: function( $revisions ) {
			var $pointers,
				escapePressed = false;

			$pointers = this.$element.find( '.mw-revslider-pointer' );

			$( 'body' ).keydown( function( e ) {
				if ( e.which === 27 ) {
					escapePressed = true;
					$pointers.trigger( 'mouseup' );
				}
			} );

			$pointers.draggable( this.buildDraggableOptions( escapePressed, $revisions ) );
		},

		/**
		 * Build options for the draggable
		 *
		 * @param {boolean} escapePressed
		 * @param {jQuery} $revisions
		 * @return {Object}
		 */
		buildDraggableOptions: function( escapePressed, $revisions ) {
			var lastValidLeftPos,
				self = this;

			return {
				axis: 'x',
				grid: [ this.revisionWidth, null ],
				containment: '.mw-revslider-pointer-container',
				start: function() {
					$( '.mw-revslider-revision-wrapper' )
						.addClass( 'mw-revslider-pointer-cursor' );
					escapePressed = false;
				},
				stop: function() {
					var $p = $( this ),
						relativeIndex = self.getRelativePointerIndex( $p ),
						pointer = self.whichPointer( $p ),
						revId1, revId2;

					$( '.mw-revslider-revision-wrapper' ).removeClass( 'mw-revslider-pointer-cursor' );

					if ( escapePressed ) {
						self.updatePointerPositionAttributes();
						self.resetPointerStylesBasedOnPosition();
						return;
					}

					mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );
					pointer.setPosition( self.slider.getOldestVisibleRevisionIndex() + relativeIndex );
					self.updatePointerPositionAttributes();
					self.resetPointerStylesBasedOnPosition();
					self.resetRevisionStylesBasedOnPointerPosition( $revisions );

					revId1 = self.getRevElementAtPosition(
						$revisions, self.pointerOlder.getPosition()
					).data( 'revid' );

					revId2 = self.getRevElementAtPosition(
						$revisions, self.pointerNewer.getPosition()
					).data( 'revid' );

					self.refreshRevisions( revId1, revId2 );

					self.redrawPointerLines();
				},
				drag: function( event, ui ) {
					var olderLeftPos, newerLeftPos,
						isNew = $( this ).hasClass( 'mw-revslider-pointer-newer' );

					ui.position.left = Math.min(
						ui.position.left,
						self.getNewestVisibleRevisonLeftPos()
					);

					olderLeftPos = self.pointerOlder.getView().getElement().position().left;
					newerLeftPos = self.pointerNewer.getView().getElement().position().left;

					if ( ui.position.left === ( isNew ? olderLeftPos : newerLeftPos ) ) {
						ui.position.left = lastValidLeftPos;
					} else {
						lastValidLeftPos = ui.position.left;
						if ( self.dir === 'ltr' ) {
							self.resetPointerColorsBasedOnValues( olderLeftPos, newerLeftPos );
						} else {
							self.resetPointerColorsBasedOnValues( newerLeftPos, olderLeftPos );
						}
					}
				},
				revert: function() {
					return escapePressed;
				}
			};
		},

		/**
		 * Get the relative index for a pointer.
		 *
		 * @param {jQuery} $pointer
		 * @return {number}
		 */
		getRelativePointerIndex: function( $pointer ) {
			var pos = $pointer.position().left,
				pointer = this.whichPointer( $pointer );

			if ( this.dir === 'rtl' ) {
				pos = pointer.getView().getAdjustedLeftPositionWhenRtl( pos );
			}
			return Math.ceil( ( pos + this.revisionWidth / 2 ) / this.revisionWidth );
		},

		getNewestVisibleRevisonLeftPos: function() {
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
			view.refreshRevisions(
				+view.getRevElementAtPosition( $revisions, pOther.getPosition() ).data( 'revid' ),
				+$clickedRev.data( 'revid' )
			);
			view.resetPointerColorsBasedOnValues( view.pointerOlder.getPosition(), view.pointerNewer.getPosition() );
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
		 * @param {number} revId1
		 * @param {number} revId2
		 */
		refreshRevisions: function ( revId1, revId2 ) {
			var oldRev = Math.min( revId1, revId2 ),
				newRev = Math.max( revId1, revId2 );
			this.diffPage.refresh( oldRev, newRev, this );
			this.diffPage.pushState( oldRev, newRev, this );
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

		resetAndRefreshRevisions: function() {
			this.slide( 0 );
			this.resetPointerStylesBasedOnPosition();
			this.resetRevisionStylesBasedOnPointerPosition(
				this.$element.find( 'div.mw-revslider-revisions' )
			);
			this.updatePointerPositionAttributes();
			this.refreshRevisions(
				$( '.mw-revslider-revision[data-pos="' + this.pointerOlder.getPosition() + '"]' ).attr( 'data-revid' ),
				$( '.mw-revslider-revision[data-pos="' + this.pointerNewer.getPosition() + '"]' ).attr( 'data-revid' )
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
				throw 'RS-revs-not-specified';
			}
			if ( $oldRevElement.length !== 0 ) {
				this.pointerOlder.setPosition( $oldRevElement.data( 'pos' ) );
			} else {
				this.pointerOlder.setPosition( -1 );
			}
			this.pointerNewer.setPosition( $newRevElement.data( 'pos' ) );
			this.resetPointerStylesBasedOnPosition();
			this.updatePointerPositionAttributes();
		},

		/**
		 * Adjusts the colors of the pointers without changing the upper/lower property based on values `p1` and `p2`.
		 * Used e.g. when pointers get dragged past one another.
		 *
		 * @param {number} p1
		 * @param {number} p2
		 */
		resetPointerColorsBasedOnValues: function ( p1, p2 ) {
			if ( p1 > p2 ) {
				this.pointerOlder.getView().getElement().removeClass( 'mw-revslider-pointer-oldid' ).addClass( 'mw-revslider-pointer-newid' );
				this.pointerNewer.getView().getElement().removeClass( 'mw-revslider-pointer-newid' ).addClass( 'mw-revslider-pointer-oldid' );
			} else {
				this.pointerOlder.getView().getElement().removeClass( 'mw-revslider-pointer-newid' ).addClass( 'mw-revslider-pointer-oldid' );
				this.pointerNewer.getView().getElement().removeClass( 'mw-revslider-pointer-oldid' ).addClass( 'mw-revslider-pointer-newid' );
			}
		},

		/**
		 * Resets the pointer styles (upper/lower, blue/yellow) based on their position.
		 */
		resetPointerStylesBasedOnPosition: function () {
			this.getNewRevPointer().getView().getElement().removeClass( 'mw-revslider-pointer-oldid' ).addClass( 'mw-revslider-pointer-newid' )
				.removeClass( 'mw-revslider-pointer-lower' ).addClass( 'mw-revslider-pointer-upper' );
			this.getOldRevPointer().getView().getElement().removeClass( 'mw-revslider-pointer-newid' ).addClass( 'mw-revslider-pointer-oldid' )
				.removeClass( 'mw-revslider-pointer-upper' ).addClass( 'mw-revslider-pointer-lower' );
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
			$( '.mw-revslider-pointer-line-upper, .mw-revslider-pointer-line-lower' )
				.removeClass( 'mw-revslider-bottom-line mw-revslider-left-line mw-revslider-right-line' );
			this.pointerOlder.getLine().drawLine();
			this.pointerNewer.getLine().drawLine();
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
			var $dummy = $( '<div>' )
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

			this.pointerOlder.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetPointerStylesBasedOnPosition();
					self.redrawPointerLines();
				} );
			this.pointerNewer.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetPointerStylesBasedOnPosition();
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
			this.diffPage.replaceState( revIdOld, revIdNew, this );

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
		}

	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;

	mw.libs.revisionSlider.calculateRevisionsPerWindow = function ( margin, revisionWidth ) {
		return Math.floor( ( $( '#mw-content-text' ).width() - margin ) / revisionWidth );
	};
}( mediaWiki, jQuery ) );
