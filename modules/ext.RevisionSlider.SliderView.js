( function ( mw, $ ) {
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
		pointerOne: null,

		/**
		 * @type {Pointer}
		 */
		pointerTwo: null,

		render: function ( $container ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				$slider = $( '<div>' ).addClass( 'mw-revision-slider' ),
				self = this;

			this.pointerOne = new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-one' );
			this.pointerTwo = new mw.libs.revisionSlider.Pointer( 'mw-revslider-pointer-two' );

			$slider.css( {
					width: ( containerWidth + this.containerMargin ) + 'px'
				} )
				.append(
					$( '<a> ' )
						.addClass( 'mw-arrow mw-arrow-left' )
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
						.addClass( 'mw-arrow mw-arrow-right' )
						.attr( 'data-dir', '1' )
						.tipsy( {
							gravity: function () {
								return Math.abs( window.innerWidth - this.getBoundingClientRect().right ) > 90 ? 'n' : 'ne';
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
						.css( { width: containerWidth + this.revisionWidth - 1 + 'px' } )
						.append( this.pointerOne.getView().render(), this.pointerTwo.getView().render() )
				);

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
						relativeIndex = Math.ceil( ( pos + self.revisionWidth / 2 ) / self.revisionWidth ),
						revId1, revId2;
					mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );
					pointer.setPosition( self.slider.getFirstVisibleRevisionIndex() + relativeIndex );
					self.resetPointerStylesBasedOnPosition();
					self.resetRevisionStylesBasedOnPointerPosition( $revisions );

					revId1 = self.getRevElementAtPosition( $revisions, self.pointerOne.getPosition() ).data( 'revid' );
					revId2 = self.getRevElementAtPosition( $revisions, self.pointerTwo.getPosition() ).data( 'revid' );

					self.diffPage.refresh( revId1, revId2 );
					self.diffPage.pushState( revId1, revId2, self );

					$( '.mw-revision-wrapper' ).removeClass( 'mw-pointer-cursor' );
				},
				drag: function ( event, ui ) {
					var newestVisibleRevisionLeftPos = containerWidth - self.revisionWidth;
					ui.position.left = Math.min( ui.position.left, newestVisibleRevisionLeftPos );
					self.resetPointerColorsBasedOnValues(
						self.pointerOne.getView().getElement().offset().left,
						self.pointerTwo.getView().getElement().offset().left
					);
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

				self.resetPointerColorsBasedOnValues( self.pointerOne.getPosition(), self.pointerTwo.getPosition() );
				self.resetRevisionStylesBasedOnPointerPosition( $revisions );
				self.alignPointers();
			} );

			this.slider.setRevisionsPerWindow( $slider.find( '.mw-revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( ( this.pointerTwo.getPosition() - 1 ) / this.slider.getRevisionsPerWindow() ), 0 );
			this.diffPage.pushState( mw.config.values.extRevisionSliderOldRev, mw.config.values.extRevisionSliderNewRev, this );
			this.diffPage.initOnPopState( this );
		},

		getOldRevPointer: function () {
			return this.pointerOne.getPosition() <= this.pointerTwo.getPosition() ? this.pointerOne : this.pointerTwo;
		},

		getNewRevPointer: function () {
			return this.pointerOne.getPosition() > this.pointerTwo.getPosition() ? this.pointerOne : this.pointerTwo;
		},

		refreshRevisions: function ( revId1, revId2 ) {
			var oldRev = Math.min( revId1, revId2 ),
				newRev = Math.max( revId1, revId2 );
			this.diffPage.refresh( oldRev, newRev );
			this.diffPage.pushState( oldRev, newRev, this );
		},

		getRevElementAtPosition: function ( $revs, pos ) {
			return $revs.find( 'div.mw-revision[data-pos="' + pos + '"]' );
		},

		getOldRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revision[data-revid="' + mw.config.values.extRevisionSliderOldRev + '"]' );
		},

		getNewRevElement: function ( $revs ) {
			return $revs.find( 'div.mw-revision[data-revid="' + mw.config.values.extRevisionSliderNewRev + '"]' );
		},

		initializePointers: function ( $oldRevElement, $newRevElement ) {
			if ( $oldRevElement.length === 0 || $newRevElement.length === 0 ) {
				// Note: this is currently caught in init.js
				throw 'RS-rev-out-of-range';
			}
			this.pointerOne.setPosition( $oldRevElement.data( 'pos' ) );
			this.pointerTwo.setPosition( $newRevElement.data( 'pos' ) );
			this.resetPointerStylesBasedOnPosition();
		},

		resetPointerColorsBasedOnValues: function ( p1, p2 ) {
			if ( p1 > p2 ) {
				this.pointerOne.getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' );
			} else {
				this.pointerOne.getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' );
			}
		},

		resetPointerStylesBasedOnPosition: function () {
			this.getNewRevPointer().getView().getElement().removeClass( 'mw-oldid-pointer' ).addClass( 'mw-newid-pointer' )
				.removeClass( 'mw-lower-pointer' ).addClass( 'mw-upper-pointer' );
			this.getOldRevPointer().getView().getElement().removeClass( 'mw-newid-pointer' ).addClass( 'mw-oldid-pointer' )
				.removeClass( 'mw-upper-pointer' ).addClass( 'mw-lower-pointer' );
		},

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

		calculateRevisionsPerWindow: function () {
			return Math.floor( ( $( '#mw-content-text' ).width() - this.containerMargin ) / this.revisionWidth );
		},

		calculateSliderContainerWidth: function () {
			return Math.min( this.slider.getRevisions().getLength(), this.calculateRevisionsPerWindow() ) * this.revisionWidth;
		},

		slide: function ( direction, duration ) {
			var self = this;

			this.slider.slide( direction );
			self.pointerOne.getView().getElement().draggable( 'disable' );
			self.pointerTwo.getView().getElement().draggable( 'disable' );

			if ( this.slider.isAtStart() ) {
				$( '.mw-arrow-left' ).removeClass( 'mw-arrow-enabled mw-arrow-hovered' ).addClass( 'mw-arrow-disabled' );
			} else {
				$( '.mw-arrow-left' ).removeClass( 'mw-arrow-disabled' ).addClass( 'mw-arrow-enabled' );
			}
			if ( this.slider.isAtEnd() ) {
				$( '.mw-arrow-right' ).removeClass( 'mw-arrow-enabled mw-arrow-hovered' ).addClass( 'mw-arrow-disabled' );
			} else {
				$( '.mw-arrow-right' ).removeClass( 'mw-arrow-disabled' ).addClass( 'mw-arrow-enabled' );
			}

			this.$element.find( '.mw-revisions-container' ).animate(
				{ scrollLeft: this.slider.getFirstVisibleRevisionIndex() * this.revisionWidth },
				duration,
				null,
				function () {
					self.pointerOne.getView().getElement().draggable( 'enable' );
					self.pointerTwo.getView().getElement().draggable( 'enable' );
				}
			);

			this.alignPointers( duration );
		},

		alignPointers: function ( duration ) {
			var self = this;

			this.pointerOne.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetPointerStylesBasedOnPosition();
				} );
			this.pointerTwo.getView()
				.slideToSideOrPosition( this.slider, duration )
				.promise().done( function () {
					self.resetPointerStylesBasedOnPosition();
				} );
		},

		whichPointer: function ( $e ) {
			return $e.attr( 'id' ) === 'mw-revslider-pointer-one' ? this.pointerOne : this.pointerTwo;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
