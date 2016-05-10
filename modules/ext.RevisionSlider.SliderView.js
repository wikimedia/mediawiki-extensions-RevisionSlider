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
				sectionLegend = new mw.libs.revisionSlider.SectionLegend( this.slider.getRevisions() ),
				diffPage = new mw.libs.revisionSlider.DiffPage( this.slider.getRevisions() ),
				$revisions = this.slider.getRevisions().getView().render( this.revisionWidth, sectionLegend.getSectionColorMap() ),
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
				)
				.append( sectionLegend.getHtml() );

			$slider.find( '.arrow' ).click( function () {
				self.slide( $( this ).data( 'dir' ) );
			} );

			$slider.find( '.pointer' ).draggable( {
				axis: 'x',
				snap: '.stopper',
				containment: '.pointer-container',
				stop: function () {
					var $p = $( this ),
						pointer = self.whichPointer( $p ),
						pos = parseInt( $p.css( 'left' ), 10 );
					pointer.setPosition( self.slider.getFirstVisibleRevisionIndex() + Math.floor( pos / self.revisionWidth ) );
					diffPage.refresh(
						$revisions
							.find( 'div.revision[data-pos=\'' + self.leftPointer.getPosition() + '\']' )
							.attr( 'data-revid' ),
						$revisions
							.find( 'div.revision[data-pos=\'' + self.rightPointer.getPosition() + '\']' )
							.attr( 'data-revid' )
					);
				}
			} );

			this.$element = $slider;
			$container.html( $slider );
			this.slider.setRevisionsPerWindow( $container.find( '.revisions-container' ).width() / this.revisionWidth );

			this.initializeSlider(
				$container.attr( 'data-oldrev' ),
				$container.attr( 'data-newrev' ),
				$revisions
			);

		},

		initializeSlider: function ( oldRevId, newRevId, $revisions ) {
			this.leftPointer.setPosition(
				$revisions
					.find( 'div.revision[data-revid=\'' + oldRevId + '\']' )
					.attr( 'data-pos' )
			);
			this.rightPointer.setPosition(
				$revisions
					.find( 'div.revision[data-revid=\'' + newRevId + '\']' )
					.attr( 'data-pos' )
			);
			this.slide( Math.floor( this.rightPointer.getPosition() / this.slider.getRevisionsPerWindow() ), 0 );
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

			this.leftPointer.getView().slideToSideOrPosition( this, duration );
			this.rightPointer.getView().slideToSideOrPosition( this, duration );
		},

		whichPointer: function ( $e ) {
			return $e.hasClass( 'left-pointer' ) ? this.leftPointer : this.rightPointer;
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SliderView = SliderView;
}( mediaWiki, jQuery ) );
