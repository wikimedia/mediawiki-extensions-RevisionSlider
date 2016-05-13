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
		leftPointer: null,

		/**
		 * @type {Pointer}
		 */
		rightPointer: null,

		render: function ( $container ) {
			var containerWidth = this.calculateSliderContainerWidth(),
				diffPage = new mw.libs.revisionSlider.DiffPage( this.slider.getRevisions() ),
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth ),
				$slider = $( '<div class="revision-slider"/>' ),
				self = this;

			this.leftPointer = new mw.libs.revisionSlider.Pointer( 'left-pointer', -this.revisionWidth );
			this.rightPointer = new mw.libs.revisionSlider.Pointer( 'right-pointer', 0 );

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
						.append( this.leftPointer.getView().render() )
						.append( this.rightPointer.getView().render() )
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
						.find( 'div.revision[data-pos=\'' + self.leftPointer.getPosition() + '\']' )
						.data( 'revid' );
					revId2 = $revisions
						.find( 'div.revision[data-pos=\'' + self.rightPointer.getPosition() + '\']' )
						.data( 'revid' );

					diffPage.refresh( revId1, revId2 );
					diffPage.pushState( revId1, revId2, self );
				},
				drag: function () {
					var leftPointerOffset = self.leftPointer.getView().getElement().offset(),
						rightPointerOffset = self.rightPointer.getView().getElement().offset();
					if ( leftPointerOffset.left > rightPointerOffset.left ) {
						self.leftPointer.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
						self.rightPointer.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
					} else {
						self.leftPointer.getView().getElement().removeClass( 'newid-pointer' ).addClass( 'oldid-pointer' );
						self.rightPointer.getView().getElement().removeClass( 'oldid-pointer' ).addClass( 'newid-pointer' );
					}
				}
			} );

			this.slider.setRevisionsPerWindow( $slider.find( '.revisions-container' ).width() / this.revisionWidth );

			this.initializePointers( $revisions );

			this.$element = $slider;
			$container.html( $slider );

			this.slide( Math.floor( this.rightPointer.getPosition() / this.slider.getRevisionsPerWindow() ), 0 );
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
			this.leftPointer.setPosition( oldRevElement.data( 'pos' ) );
			this.rightPointer.setPosition( newRevElement.data( 'pos' ) );
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
			self.leftPointer.getView().getElement().draggable( 'disable' );
			self.rightPointer.getView().getElement().draggable( 'disable' );

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
					self.leftPointer.getView().getElement().draggable( 'enable' );
					self.rightPointer.getView().getElement().draggable( 'enable' );
				}
			);

			this.leftPointer.getView().slideToSideOrPosition( this.slider, duration );
			this.rightPointer.getView().slideToSideOrPosition( this.slider, duration );
		},

		whichPointer: function ( $e ) {
			return $e.hasClass( 'left-pointer' ) ? this.leftPointer : this.rightPointer;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
