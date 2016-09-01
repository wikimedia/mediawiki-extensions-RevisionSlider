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

		render: function ( $container ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				pointerContainerPosition = 53,
				pointerContainerWidth = containerWidth + this.revisionWidth - 1,
				pointerContainerStyle,
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				$slider = $( '<div>' )
					.addClass( 'mw-revslider-revision-slider' )
					.css( { direction: $container.css( 'direction' ) } ),
				helpButton,
				helpPopup,
				backwardArrowPopup,
				forwardArrowPopup,
				self = this;

			if ( $slider.css( 'direction' ) === 'rtl' ) {
				this.rtlScrollLeftType = this.determineRtlScrollType();
			}

			this.pointerOlder = this.pointerOlder || new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-older' );
			this.pointerNewer = this.pointerNewer || new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-newer' );

			helpPopup = new OO.ui.PopupWidget( {
				$content: $( '<p>' ).text( mw.msg( 'revisionslider-show-help-tooltip' ) ),
				padded: true,
				width: 200,
				classes: [ 'mw-revslider-tooltip', 'mw-revslider-help-tooltip' ]
			} );

			helpButton = new OO.ui.ButtonWidget( {
				icon: 'help',
				framed: false,
				classes: [ 'mw-revslider-show-help' ]
			} );
			helpButton.$element
				.click( function () {
					mw.libs.revisionSlider.HelpDialog.show();
				} )
				.mouseover( { popup: helpPopup }, this.showPopup )
				.mouseout( function () { helpPopup.toggle( false ); } );

			backwardArrowPopup = new OO.ui.PopupWidget( {
				$content: $( '<p>' ).text( mw.msg( 'revisionslider-arrow-tooltip-older' ) ),
				padded: true,
				width: 200,
				classes: [ 'mw-revslider-tooltip', 'mw-revslider-arrow-tooltip' ]
			} );
			forwardArrowPopup = new OO.ui.PopupWidget( {
				$content: $( '<p>' ).text( mw.msg( 'revisionslider-arrow-tooltip-newer' ) ),
				padded: true,
				width: 200,
				classes: [ 'mw-revslider-tooltip', 'mw-revslider-arrow-tooltip' ]
			} );
			$( 'body' ).append( backwardArrowPopup.$element, forwardArrowPopup.$element, helpPopup.$element );

			this.backwardArrowButton = new OO.ui.ButtonWidget( {
				icon: 'previous',
				width: 20,
				height: 140,
				framed: true,
				classes: [ 'mw-revslider-arrow', 'mw-revslider-arrow-backwards' ]
			} );
			this.backwardArrowButton.connect( this, {
				click: [ 'arrowClickHandler', this.backwardArrowButton ]
			} );
			this.backwardArrowButton.$element
				.attr( 'data-dir', -1 )
				.mouseover( { button: this.backwardArrowButton, popup: backwardArrowPopup }, this.showPopup )
				.mouseout( { popup: backwardArrowPopup }, this.hidePopup )
				.focusin( { button: this.backwardArrowButton }, this.arrowFocusHandler );

			this.forwardArrowButton = new OO.ui.ButtonWidget( {
				icon: 'next',
				width: 20,
				height: 140,
				framed: true,
				classes: [ 'mw-revslider-arrow', 'mw-revslider-arrow-forwards' ]
			} );
			this.forwardArrowButton.connect( this, {
				click: [ 'arrowClickHandler', this.forwardArrowButton ]
			} );
			this.forwardArrowButton.$element
				.attr( 'data-dir', 1 )
				.mouseover( { button: this.forwardArrowButton, popup: forwardArrowPopup }, this.showPopup )
				.mouseout( { popup: forwardArrowPopup }, this.hidePopup )
				.focusin( { button: this.forwardArrowButton }, this.arrowFocusHandler );

			pointerContainerStyle = { left: pointerContainerPosition + 'px', width: pointerContainerWidth + 'px' };
			if ( $slider.css( 'direction' ) === 'rtl' ) {
				// Due to properly limit dragging a pointer on the right side of the screen,
				// there must some extra space added to the right of the revision bar container
				// For this reason right position of the pointer container in the RTL mode is
				// a bit moved off right compared to its left position in the LTR mode
				pointerContainerPosition = pointerContainerPosition - this.revisionWidth + 1;
				pointerContainerStyle = { right: pointerContainerPosition + 'px', width: pointerContainerWidth + 'px' };
			}
			$slider.css( {
				width: ( containerWidth + this.containerMargin ) + 'px'
			} )
				.append(
					this.backwardArrowButton.$element,
					$( '<div>' )
						.addClass( 'mw-revslider-revisions-container' )
						.css( {
							width: containerWidth + 'px'
						} )
						.append( $revisions ),
					this.forwardArrowButton.$element,
					helpButton.$element,
					$( '<div>' ).css( { clear: 'both' } ),
					$( '<div>' )
						.addClass( 'mw-revslider-pointer-container' )
						.css( pointerContainerStyle )
						.append( this.pointerOlder.getView().render(), this.pointerNewer.getView().render() )
				);

			$slider.find( '.mw-revslider-pointer' ).draggable( {
				axis: 'x',
				grid: [ this.revisionWidth, null ],
				containment: '.mw-revslider-pointer-container',
				start: function () {
					$( '.mw-revslider-revision-wrapper' ).addClass( 'mw-revslider-pointer-cursor' );
				},
				stop: function () {
					var $p = $( this ),
						pointer = self.whichPointer( $p ),
						pos = parseInt( $p.css( 'left' ), 10 ),
						adjustedPos = $p.offsetParent().css( 'direction' ) === 'rtl' ? pointer.getView().getAdjustedLeftPositionWhenRtl( pos ) : pos,
						relativeIndex = Math.ceil( ( adjustedPos + self.revisionWidth / 2 ) / self.revisionWidth ),
						revId1, revId2;
					mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );
					pointer.setPosition( self.slider.getFirstVisibleRevisionIndex() + relativeIndex );
					self.resetPointerStylesBasedOnPosition();
					self.resetRevisionStylesBasedOnPointerPosition( $revisions );

					revId1 = self.getRevElementAtPosition( $revisions, self.pointerOlder.getPosition() ).data( 'revid' );
					revId2 = self.getRevElementAtPosition( $revisions, self.pointerNewer.getPosition() ).data( 'revid' );

					self.refreshRevisions( revId1, revId2 );

					$( '.mw-revslider-revision-wrapper' ).removeClass( 'mw-revslider-pointer-cursor' );
				},
				drag: function ( event, ui ) {
					var newestVisibleRevisionLeftPos = $( '.mw-revslider-revisions-container' ).width() - self.revisionWidth;
					ui.position.left = Math.min( ui.position.left, newestVisibleRevisionLeftPos );
					if ( $( this ).css( 'direction' ) === 'ltr' ) {
						self.resetPointerColorsBasedOnValues(
							self.pointerOlder.getView().getElement().offset().left,
							self.pointerNewer.getView().getElement().offset().left
						);
					} else {
						self.resetPointerColorsBasedOnValues(
							self.pointerNewer.getView().getElement().offset().left,
							self.pointerOlder.getView().getElement().offset().left
						);
					}
				}
			} );

			$slider.find( '.mw-revslider-revision-wrapper' ).on( 'click', null, { view: self, revisionsDom: $revisions }, this.revisionWrapperClickHandler );

			this.slider.setRevisionsPerWindow( $slider.find( '.mw-revslider-revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( ( this.pointerNewer.getPosition() - 1 ) / this.slider.getRevisionsPerWindow() ), 0 );
			this.diffPage.replaceState( mw.config.values.extRevisionSliderOldRev, mw.config.values.extRevisionSliderNewRev, this );
			this.diffPage.initOnPopState( this );
		},

		showPopup: function ( e ) {
			var button = e.data.button,
				popup = e.data.popup;
			if ( typeof button !== 'undefined' && button.isDisabled() ) {
				return;
			}
			popup.$element.css( {
				left: $( this ).offset().left + $( this ).outerWidth() / 2 + 'px',
				top: $( this ).offset().top + $( this ).outerHeight() + 'px'
			} );
			popup.toggle( true );
		},

		hidePopup: function ( e ) {
			var popup = e.data.popup;
			popup.toggle( false );
		},

		/**
		 * @param {OO.ui.ButtonWidget} button
		 */
		arrowClickHandler: function ( button ) {
			if ( button.isDisabled() ) {
				return;
			}
			mw.track( 'counter.MediaWiki.RevisionSlider.event.arrowClick' );
			this.slide( button.$element.data( 'dir' ) );
		},

		/**
		 * Disabled oo.ui.ButtonWidgets get focused when clicked. In particular cases
		 * (arrow gets clicked when disabled, none other elements gets focus meanwhile, the other arrow is clicked)
		 * previously disabled arrow button still has focus and has OOjs-ui focused button styles
		 * applied (blue border) which is not what is wanted. And generally setting a focus on disabled
		 * buttons does not seem right in case of RevisionSlider's arrow buttons.
		 * This method removes focus from the disabled button if such case happens.
		 *
		 * @param {jQuery.Event} e
		 */
		arrowFocusHandler: function ( e ) {
			var button = e.data.button;
			if ( button.isDisabled() ) {
				button.$element.find( 'a.oo-ui-buttonElement-button' ).blur();
			}
		},

		revisionWrapperClickHandler: function ( e ) {
			var $revWrap = $( this ),
				view = e.data.view,
				$revisions = e.data.revisionsDom,
				$clickedRev = $revWrap.find( '.mw-revslider-revision' ),
				hasClickedTop = e.pageY - $revWrap.offset().top < $revWrap.height() / 2,
				pOld = view.getOldRevPointer(),
				pNew = view.getNewRevPointer();

			if ( hasClickedTop ) {
				pNew.setPosition( parseInt( $clickedRev.attr( 'data-pos' ), 10 ) );
				view.refreshRevisions(
					view.getRevElementAtPosition( $revisions, pOld.getPosition() ).data( 'revid' ),
					$clickedRev.data( 'revid' )
				);
			} else {
				pOld.setPosition( parseInt( $clickedRev.attr( 'data-pos' ), 10 ) );
				view.refreshRevisions(
					$clickedRev.data( 'revid' ),
					view.getRevElementAtPosition( $revisions, pNew.getPosition() ).data( 'revid' )
				);
			}

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
			this.diffPage.refresh( oldRev, newRev );
			this.diffPage.pushState( oldRev, newRev, this );
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
			return $revs.find( 'div.mw-revslider-revision[data-revid="' + mw.config.values.extRevisionSliderOldRev + '"]' );
		},

		/**
		 * Gets the jQuery element of the newer selected revision
		 *
		 * @param {jQuery} $revs
		 * @return {jQuery}
		 */
		getNewRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revslider-revision[data-revid="' + mw.config.values.extRevisionSliderNewRev + '"]' );
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

			animateObj = { scrollLeft: this.slider.getFirstVisibleRevisionIndex() * this.revisionWidth };
			if ( this.$element.css( 'direction' ) === 'rtl' ) {
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
				} );
			this.pointerNewer.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetPointerStylesBasedOnPosition();
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

				/* jshint -W024 */
				if ( data.continue === undefined ) { // eslint-disable-line dot-notation
					self.noMoreNewerRevisions = true;
				}
				/* jshint +W024 */
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

				/* jshint -W024 */
				if ( data.continue === undefined ) { // eslint-disable-line dot-notation
					self.noMoreOlderRevisions = true;
				}
				/* jshint +W024 */
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

			$addedRevisions = new mw.libs.revisionSlider.RevisionListView( revisionsToRender ).render( this.revisionWidth, revPositionOffset );

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

			$addedRevisions = new mw.libs.revisionSlider.RevisionListView( revisionsToRender ).render( this.revisionWidth );

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

			this.slider.setFirstVisibleRevisionIndex( this.slider.getFirstVisibleRevisionIndex() + revisionsToRender.getLength() );

			revIdOld = self.getRevElementAtPosition( $revisions, pOld.getPosition() ).data( 'revid' );
			revIdNew = self.getRevElementAtPosition( $revisions, pNew.getPosition() ).data( 'revid' );
			this.diffPage.replaceState( revIdOld, revIdNew, this );

			scrollLeft = this.slider.getFirstVisibleRevisionIndex() * this.revisionWidth;
			$revisionContainer.scrollLeft( scrollLeft );
			if ( this.$element.css( 'direction' ) === 'rtl' ) {
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
			var sliderWidth = parseInt( $slider.css( 'width' ), 10 ),
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
