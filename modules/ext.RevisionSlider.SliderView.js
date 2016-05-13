( function ( mw, $ ) {
	var SliderView = function ( slider ) {
		this.slider = slider;
	};

	$.extend( SliderView.prototype, {
		revisionWidth: 16,

		containerMargin: 80,

		/**
		 * @type {jQuery}
		 */
		$element: null,

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
				diffPage = new mw.libs.revisionSlider.DiffPage( this.slider.getRevisions() ),
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				$slider = $( '<div class="revision-slider"/>' ),
				self = this;

			this.pointerOne = new mw.libs.revisionSlider.Pointer( 'revslider-pointer-one', -this.revisionWidth );
			this.pointerTwo = new mw.libs.revisionSlider.Pointer( 'revslider-pointer-two', 0 );

			$slider.css( {
					width: ( containerWidth + this.containerMargin ) + 'px'
				} )
				.append( $( '<a class="arrow left-arrow" data-dir="-1"></a>' ) )
				.append( $( '<div class="revisions-container" />' )
					.css( {
						width: containerWidth + 'px'
					} )
					.append( $revisions ) )
				.append( $( '<a class="arrow right-arrow" data-dir="1"></a>' ) )
				.append( $( '<div style="clear: both" />' ) )
				.append(
					$( '<div class="pointer-container" />' )
						.css( {
							left: 40 - this.revisionWidth + 'px', // 40 == arrow + margin right
							width: containerWidth + this.revisionWidth * 1.5 + 'px'
						} )
						.append( this.pointerOne.getView().render() )
						.append( this.pointerTwo.getView().render() )
				);

			$slider.find( '.arrow' ).click( function () {
				mw.track( 'counter.MediaWiki.RevisionSlider.event.arrowClick' );
				self.slide( $( this ).data( 'dir' ) );
			} );

			$slider.find( '.pointer' ).draggable( {
				axis: 'x',
				snap: '.stopper',
				containment: '.pointer-container',
				stop: function () {
					var $p = $( this ),
						pointer = self.whichPointer( $p ),
						pos = parseInt( $p.css( 'left' ), 10 ),
						relativeIndex = Math.floor( ( pos + self.revisionWidth / 2 ) / self.revisionWidth ),
						revId1, revId2;
					mw.track( 'counter.MediaWiki.RevisionSlider.event.pointerMove' );
					pointer.setPosition( self.slider.getFirstVisibleRevisionIndex() + relativeIndex );

					revId1 = $revisions
						.find( 'div.revision[data-pos=\'' + self.pointerOne.getPosition() + '\']' )
						.data( 'revid' );
					revId2 = $revisions
						.find( 'div.revision[data-pos=\'' + self.pointerTwo.getPosition() + '\']' )
						.data( 'revid' );

					diffPage.refresh( revId1, revId2 );
					diffPage.pushState( revId1, revId2, self );
				},
				drag: function () {
					self.resetPointerColorsBasedOnOffset();
				}
			} );

			this.slider.setRevisionsPerWindow( $slider.find( '.revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( this.pointerTwo.getPosition() / this.slider.getRevisionsPerWindow() ), 0 );
			diffPage.pushState( mw.config.values.extRevisionSliderOldRev, mw.config.values.extRevisionSliderNewRev, this );
			diffPage.initOnPopState( this );
		},

		initializePointers: function ( $revisions ) {
			var oldRevElement = $revisions.find( 'div.revision[data-revid=\'' + mw.config.values.extRevisionSliderOldRev + '\']' ),
				newRevElement = $revisions.find( 'div.revision[data-revid=\'' + mw.config.values.extRevisionSliderNewRev + '\']' );

			if ( oldRevElement.length === 0 || newRevElement.length === 0 ) {
				// Note: this is currently caught in init.js
				throw 'RS-rev-out-of-range';
			}
			this.pointerOne.setPosition( oldRevElement.data( 'pos' ) );
			this.pointerTwo.setPosition( newRevElement.data( 'pos' ) );
			this.resetPointerColorsBasedOnPosition();
		},

		resetPointerColorsBasedOnOffset: function () {
			var leftPointerOffset = this.pointerOne.getView().getElement().offset(),
				rightPointerOffset = this.pointerTwo.getView().getElement().offset();
			if ( leftPointerOffset.left > rightPointerOffset.left ) {
				this.pointerOne.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
			} else {
				this.pointerOne.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
			}
		},

		resetPointerColorsBasedOnPosition: function () {
			if ( this.pointerOne.getPosition() > this.pointerTwo.getPosition() ) {
				this.pointerOne.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
			} else {
				this.pointerOne.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
				this.pointerTwo.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
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
				$( '.left-arrow' ).css( 'visibility', 'hidden' );
			} else {
				$( '.left-arrow' ).css( 'visibility', '' );
			}
			if ( this.slider.isAtEnd() ) {
				$( '.right-arrow' ).css( 'visibility', 'hidden' );
			} else {
				$( '.right-arrow' ).css( 'visibility', '' );
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

			this.pointerOne.getView().slideToSideOrPosition( this.slider, duration );
			this.pointerTwo.getView().slideToSideOrPosition( this.slider, duration );
		},

		whichPointer: function ( $e ) {
			return $e.attr( 'id' ) === 'revslider-pointer-one' ? this.pointerOne : this.pointerTwo;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
