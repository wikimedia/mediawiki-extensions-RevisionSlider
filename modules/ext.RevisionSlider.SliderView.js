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
				$slider = $( '<div class="revision-slider"/>' ),
				self = this;

			this.pointerOne = new mw.libs.revisionSlider.Pointer( 'revslider-pointer-one', -this.revisionWidth );
			this.pointerTwo = new mw.libs.revisionSlider.Pointer( 'revslider-pointer-two', 0 );

			$slider.css( {
					width: ( containerWidth + this.containerMargin ) + 'px'
				} )
				.append(
					$( '<a class="arrow arrow-left" data-dir="-1"></a>' )
					.tipsy( {
						title: function () {
							if ( $( this ).hasClass( 'arrow-disabled' ) ) {
								return '';
							}
							return mw.message( 'revisionslider-arrow-tooltip-older' ).text();
						}
					} )
				)
				.append( $( '<div class="revisions-container" />' )
					.css( {
						width: containerWidth + 'px'
					} )
					.append( $revisions ) )
				.append(
					$( '<a class="arrow arrow-right" data-dir="1"></a>' )
					.tipsy( {
						gravity: function () {
							return Math.abs( window.innerWidth - this.getBoundingClientRect().right ) > 90 ? 'n' : 'ne';
						},
						title: function () {
							if ( $( this ).hasClass( 'arrow-disabled' ) ) {
								return '';
							}
							return mw.message( 'revisionslider-arrow-tooltip-newer' ).text();
						}
					} )
				)
				.append( $( '<div style="clear: both" />' ) )
				.append(
					$( '<div class="pointer-container" />' )
						.css( { width: containerWidth + this.revisionWidth - 1 + 'px' } )
						.append( this.pointerOne.getView().render() )
						.append( this.pointerTwo.getView().render() )
				);

			$slider.find( '.arrow' ).click( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'arrow-disabled' ) ) {
						return;
					}
					mw.track( 'counter.MediaWiki.RevisionSlider.event.arrowClick' );
					self.slide( $arrow.data( 'dir' ) );
				} )
				.mouseenter( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'arrow-disabled' ) ) {
						return;
					}
					$arrow.removeClass( 'arrow-enabled' ).addClass( 'arrow-hovered' );
				} )
				.mouseleave( function () {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'arrow-disabled' ) ) {
						return;
					}
					$arrow.removeClass( 'arrow-hovered' ).addClass( 'arrow-enabled' );
				} )
				.mousedown( function ( event ) {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'arrow-disabled' ) || event.which !== 1 ) {
						return;
					}
					$arrow.addClass( 'arrow-active' );
				} )
				.mouseup( function ( event ) {
					var $arrow = $( this );
					if ( $arrow.hasClass( 'arrow-disabled' ) || event.which !== 1 ) {
						return;
					}
					$arrow.removeClass( 'arrow-active' );
				} );

			$slider.find( '.pointer' ).draggable( {
				axis: 'x',
				grid: [ this.revisionWidth, null ],
				containment: '.pointer-container',
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

			$slider.find( '.revision-wrapper' ).click( function ( e ) {
				var $revWrap = $( this ),
					$clickedRev = $revWrap.find( '.revision' ),
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

			this.slider.setRevisionsPerWindow( $slider.find( '.revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( this.getOldRevElement( $revisions ), this.getNewRevElement( $revisions ) );
			this.resetRevisionStylesBasedOnPointerPosition( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( this.pointerTwo.getPosition() / this.slider.getRevisionsPerWindow() ), 0 );
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
			return $revs.find( 'div.revision[data-pos=\'' + pos + '\']' );
		},

		getOldRevElement: function ( $revs ) {
			return $revs.find( 'div.revision[data-revid=\'' + mw.config.values.extRevisionSliderOldRev + '\']' );
		},

		getNewRevElement: function ( $revs ) {
			return $revs.find( 'div.revision[data-revid=\'' + mw.config.values.extRevisionSliderNewRev + '\']' );
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
				this.pointerOne.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
			} else {
				this.pointerOne.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
			}
		},

		resetPointerStylesBasedOnPosition: function () {
			this.getNewRevPointer().getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' )
				.removeClass( 'lower-pointer' ).addClass( 'upper-pointer' );
			this.getOldRevPointer().getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' )
				.removeClass( 'upper-pointer' ).addClass( 'lower-pointer' );
		},

		resetRevisionStylesBasedOnPointerPosition: function ( $revisions ) {
			var olderRevPosition = this.getOldRevPointer().getPosition(),
				newerRevPosition = this.getNewRevPointer().getPosition(),
				positionIndex = olderRevPosition + 1;

			$revisions.find( 'div.revision' )
				.removeClass( 'revision-intermediate revision-old revision-new' );

			this.getRevElementAtPosition( $revisions, olderRevPosition ).addClass( 'revision-old' );
			this.getRevElementAtPosition( $revisions, newerRevPosition ).addClass( 'revision-new' );
			while ( positionIndex < newerRevPosition ) {
				this.getRevElementAtPosition( $revisions, positionIndex ).addClass( 'revision-intermediate' );
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
				$( '.arrow-left' ).removeClass( 'arrow-enabled' ).removeClass( 'arrow-hovered' ).addClass( 'arrow-disabled' );
			} else {
				$( '.arrow-left' ).removeClass( 'arrow-disabled' ).addClass( 'arrow-enabled' );
			}
			if ( this.slider.isAtEnd() ) {
				$( '.arrow-right' ).removeClass( 'arrow-enabled' ).removeClass( 'arrow-hovered' ).addClass( 'arrow-disabled' );
			} else {
				$( '.arrow-right' ).removeClass( 'arrow-disabled' ).addClass( 'arrow-enabled' );
			}

			this.$element.find( '.revisions-container' ).animate(
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
			return $e.attr( 'id' ) === 'revslider-pointer-one' ? this.pointerOne : this.pointerTwo;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
