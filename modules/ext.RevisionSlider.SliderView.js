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

		containerMargin: 120,

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
		 * @type {string}
		 *
		 * Value of scrollLeft property when in RTL mode varies between browser. This identifies
		 * an implementation used by user's browser:
		 * - 'default': 0 is the left-most position, values increase when scrolling right (same as scrolling from left to right in LTR mode)
		 * - 'negative': 0 is right-most position, values decrease when scrolling left (ie. all values except 0 are negative)
		 * - 'reverse': 0 is right-most position, values incrase when scrolling left
		 */
		rtlScrollLeftType: 'default',

		render: function ( $container ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				pointerContainerPosition = 55,
				pointerContainerWidth = containerWidth + this.revisionWidth - 1,
				pointerContainerStyle,
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				$slider = $( '<div>' )
					.addClass( 'mw-revision-slider' )
					.css( { direction: $container.css( 'direction' ) } ),
				self = this;

			if ( $slider.css( 'direction' ) === 'rtl' ) {
				this.rtlScrollLeftType = this.determineRtlScrollType();
			}

			this.pointerOlder = new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-older' );
			this.pointerNewer = new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-newer' );

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
					$( '<a> ' )
						.addClass( 'mw-arrow mw-arrow-backwards' )
						.attr( 'data-dir', '-1' )
						.tipsy( {
							title: function () {
								if ( $( this ).hasClass( 'mw-arrow-disabled' ) ) {
									return '';
								}
								return mw.message( 'revisionslider-arrow-tooltip-older' ).text();
							}
						} ),
					$( '<div>' )
						.addClass( 'mw-revisions-container' )
						.css( {
							width: containerWidth + 'px'
						} )
						.append( $revisions ),
					$( '<a> ' )
						.addClass( 'mw-arrow mw-arrow-forwards' )
						.attr( 'data-dir', '1' )
						.tipsy( {
							gravity: function () {
								if ( $slider.css( 'direction' ) === 'ltr' ) {
									return Math.abs( window.innerWidth - this.getBoundingClientRect().right ) > 90 ? 'n' : 'ne';
								} else {
									return this.getBoundingClientRect().left > 90 ? 'n' : 'nw';
								}
							},
							title: function () {
								if ( $( this ).hasClass( 'mw-arrow-disabled' ) ) {
									return '';
								}
								return mw.message( 'revisionslider-arrow-tooltip-newer' ).text();
							}
						} ),
					$( '<div>' ).css( { clear: 'both' } ),
					$( '<div>' )
						.addClass( 'mw-pointer-container' )
						.css( pointerContainerStyle )
						.append( this.pointerOlder.getView().render(), this.pointerNewer.getView().render() )
				);

			if ( $slider.css( 'direction' ) === 'ltr' ) {
				$slider.find( '.mw-arrow-backwards' ).addClass( 'mw-arrow-left' );
				$slider.find( '.mw-arrow-forwards' ).addClass( 'mw-arrow-right' );
			} else {
				$slider.find( '.mw-arrow-backwards' ).addClass( 'mw-arrow-right' );
				$slider.find( '.mw-arrow-forwards' ).addClass( 'mw-arrow-left' );
			}

			$slider.find( '.mw-arrow' ).click( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'mw-arrow-disabled' ) ) {
						return;
					}
					mw.track( 'counter.MediaWiki.RevisionSlider.event.arrowClick' );
					self.slide( $arrow.data( 'dir' ) );
				} )
				.mouseenter( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'mw-arrow-disabled' ) ) {
						return;
					}
					$arrow.removeClass( 'mw-arrow-enabled' ).addClass( 'mw-arrow-hovered' );
				} )
				.mouseleave( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'mw-arrow-disabled' ) ) {
						return;
					}
					$arrow.removeClass( 'mw-arrow-hovered' ).addClass( 'mw-arrow-enabled' );
				} )
				.mousedown( function ( event ) {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'mw-arrow-disabled' ) || event.which !== 1 ) {
						return;
					}
					$arrow.addClass( 'mw-arrow-active' );
				} )
				.mouseup( function ( event ) {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'mw-arrow-disabled' ) || event.which !== 1 ) {
						return;
					}
					$arrow.removeClass( 'mw-arrow-active' );
				} );

			$slider.find( '.mw-pointer' ).draggable( {
				axis: 'x',
				grid: [ this.revisionWidth, null ],
				containment: '.mw-pointer-container',
				start: function () {
					$( '.mw-revision-wrapper' ).addClass( 'mw-pointer-cursor' );
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

					self.diffPage.refresh( revId1, revId2 );
					self.diffPage.pushState( revId1, revId2, self );

					$( '.mw-revision-wrapper' ).removeClass( 'mw-pointer-cursor' );
				},
				drag: function ( event, ui ) {
					var newestVisibleRevisionLeftPos = containerWidth - self.revisionWidth;
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

			$slider.find( '.mw-revision-wrapper' ).click( function ( e ) {
				var $revWrap = $( this ),
					$clickedRev = $revWrap.find( '.mw-revision' ),
					hasClickedTop = e.pageY - $revWrap.offset().top < $revWrap.height() / 2,
					pOld = self.getOldRevPointer(),
					pNew = self.getNewRevPointer();

				if ( hasClickedTop ) {
					self.refreshRevisions(
						self.getRevElementAtPosition( $revisions, pOld.getPosition() ).data( 'revid' ),
						$clickedRev.data( 'revid' )
					);
					pNew.setPosition( $clickedRev.data( 'pos' ) );
				} else {
					self.refreshRevisions(
						$clickedRev.data( 'revid' ),
						self.getRevElementAtPosition( $revisions, pNew.getPosition() ).data( 'revid' )
					);
					pOld.setPosition( $clickedRev.data( 'pos' ) );
				}

				self.resetPointerColorsBasedOnValues( self.pointerOlder.getPosition(), self.pointerNewer.getPosition() );
				self.resetRevisionStylesBasedOnPointerPosition( $revisions );
				self.alignPointers();
			} );

			this.slider.setRevisionsPerWindow( $slider.find( '.mw-revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( ( this.pointerNewer.getPosition() - 1 ) / this.slider.getRevisionsPerWindow() ), 0 );
			this.diffPage.pushState( mw.config.values.extRevisionSliderOldRev, mw.config.values.extRevisionSliderNewRev, this );
			this.diffPage.initOnPopState( this );
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
			return $revs.find( 'div.mw-revision[data-pos="' + pos + '"]' );
		},

		/**
		 * Gets the jQuery element of the older selected revision
		 *
		 * @param {jQuery} $revs
		 * @return {jQuery}
		 */
		getOldRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revision[data-revid="' + mw.config.values.extRevisionSliderOldRev + '"]' );
		},

		/**
		 * Gets the jQuery element of the newer selected revision
		 *
		 * @param {jQuery} $revs
		 * @return {jQuery}
		 */
		getNewRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revision[data-revid="' + mw.config.values.extRevisionSliderNewRev + '"]' );
		},

		/**
		 * Initializes the Pointer objects based on the selected revisions
		 *
		 * @param {jQuery} $oldRevElement
		 * @param {jQuery} $newRevElement
		 */
		initializePointers: function ( $oldRevElement, $newRevElement ) {
			if ( $oldRevElement.length === 0 || $newRevElement.length === 0 ) {
				// Note: this is currently caught in init.js
				throw 'RS-rev-out-of-range';
			}
			this.pointerOlder.setPosition( $oldRevElement.data( 'pos' ) );
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
				this.pointerOlder.getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' );
				this.pointerNewer.getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' );
			} else {
				this.pointerOlder.getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' );
				this.pointerNewer.getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' );
			}
		},

		/**
		 * Resets the pointer styles (upper/lower, blue/yellow) based on their position.
		 */
		resetPointerStylesBasedOnPosition: function () {
			this.getNewRevPointer().getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' )
				.removeClass( 'mw-lower-pointer' ).addClass( 'mw-upper-pointer' );
			this.getOldRevPointer().getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' )
				.removeClass( 'mw-upper-pointer' ).addClass( 'mw-lower-pointer' );
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

			$revisions.find( 'div.mw-revision' )
				.removeClass( 'mw-revision-intermediate mw-revision-old mw-revision-new' );

			this.getRevElementAtPosition( $revisions, olderRevPosition ).addClass( 'mw-revision-old' );
			this.getRevElementAtPosition( $revisions, newerRevPosition ).addClass( 'mw-revision-new' );
			while ( positionIndex < newerRevPosition ) {
				this.getRevElementAtPosition( $revisions, positionIndex ).addClass( 'mw-revision-intermediate' );
				positionIndex++;
			}
		},

		/**
		 * Determines how many revisions fit onto the screen at once depending on the browser window width
		 *
		 * @return {number}
		 */
		calculateRevisionsPerWindow: function () {
			return Math.floor( ( $( '#mw-content-text' ).width() - this.containerMargin ) / this.revisionWidth );
		},

		/**
		 * @return {number}
		 */
		calculateSliderContainerWidth: function () {
			return Math.min( this.slider.getRevisions().getLength(), this.calculateRevisionsPerWindow() ) * this.revisionWidth;
		},

		slide: function ( direction, duration ) {
			var animateObj,
				$animatedElement = this.$element.find( '.mw-revisions-container' ),
				self = this;

			this.slider.slide( direction );
			this.pointerOlder.getView().getElement().draggable( 'disable' );
			this.pointerNewer.getView().getElement().draggable( 'disable' );

			if ( this.slider.isAtStart() ) {
				$( '.mw-arrow-backwards' ).removeClass( 'mw-arrow-enabled mw-arrow-hovered' ).addClass( 'mw-arrow-disabled' );
			} else {
				$( '.mw-arrow-backwards' ).removeClass( 'mw-arrow-disabled' ).addClass( 'mw-arrow-enabled' );
			}
			if ( this.slider.isAtEnd() ) {
				$( '.mw-arrow-forwards' ).removeClass( 'mw-arrow-enabled mw-arrow-hovered' ).addClass( 'mw-arrow-disabled' );
			} else {
				$( '.mw-arrow-forwards' ).removeClass( 'mw-arrow-disabled' ).addClass( 'mw-arrow-enabled' );
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
			return $e.attr( 'id' ) === 'mw-revslider-pointer-older' ? this.pointerOlder : this.pointerNewer;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
