/**
 * Module containing presentation logic for the arrow buttons
 *
 * @class SliderArroView
 * @param {SliderView} sliderView
 * @constructor
 */
function SliderArrowView( sliderView ) {
	this.sliderView = sliderView;
}

Object.assign( SliderArrowView.prototype, {
	/**
	 * @type {SliderView}
	 */
	sliderView: null,

	/**
	 * @param {number} direction -1 or 1
	 * @return {OO.ui.ButtonWidget}
	 */
	renderArrowButton: function ( direction ) {
		const prev = direction < 0;
		const button = new OO.ui.ButtonWidget( {
			icon: prev ? 'previous' : 'next',
			width: 20,
			height: 140,
			framed: true,
			classes: [
				'mw-revslider-arrow',
				prev ? 'mw-revslider-arrow-backwards' : 'mw-revslider-arrow-forwards'
			]
		} );

		const tooltip = mw.msg( prev ? 'revisionslider-arrow-tooltip-older' : 'revisionslider-arrow-tooltip-newer' );
		const popup = new OO.ui.PopupWidget( {
			$content: $( '<p>' ).text( tooltip ),
			$floatableContainer: button.$element,
			width: 200,
			classes: [ 'mw-revslider-tooltip', 'mw-revslider-arrow-tooltip' ]
		} );

		button.connect( this, { click: [ 'arrowClickHandler', button ] } );

		button.$element
			.attr( 'data-dir', direction )
			.children().attr( 'aria-label', tooltip )
			.on( 'mouseover', { button: button, popup: popup }, this.showPopup )
			.on( 'mouseout', { popup: popup }, this.hidePopup )
			.on( 'focusin', { button: button }, this.arrowFocusHandler );

		$( document.body ).append( popup.$element );

		return button;
	},

	showPopup: function ( e ) {
		if ( e.data.button.isDisabled() ) {
			return;
		}

		const $button = $( this );
		const popup = e.data.popup;
		popup.$element.css( {
			left: $button.offset().left + $button.outerWidth() / 2 + 'px',
			top: $button.offset().top + $button.outerHeight() + 'px'
		} );
		popup.toggle( true );
	},

	hidePopup: function ( e ) {
		e.data.popup.toggle( false );
	},

	/**
	 * @private
	 * @param {OO.ui.ButtonWidget} button
	 */
	arrowClickHandler: function ( button ) {
		if ( button.isDisabled() ) {
			return;
		}
		mw.track( 'counter.MediaWiki.RevisionSlider.event.arrowClick' );
		this.sliderView.slideView( button.$element.attr( 'data-dir' ) );
	},

	/**
	 * Disabled oo.ui.ButtonWidgets get focused when clicked. In particular cases
	 * (arrow gets clicked when disabled, none other elements gets focus meanwhile, the other arrow is clicked)
	 * previously disabled arrow button still has focus and has OOUI focused button styles
	 * applied (blue border) which is not what is wanted. And generally setting a focus on disabled
	 * buttons does not seem right in case of RevisionSlider's arrow buttons.
	 * This method removes focus from the disabled button if such case happens.
	 *
	 * @private
	 * @param {jQuery.Event} e
	 */
	arrowFocusHandler: function ( e ) {
		const button = e.data.button;
		if ( button.isDisabled() ) {
			button.$element.find( 'a.oo-ui-buttonElement-button' ).trigger( 'blur' );
		}
	}
} );

module.exports = SliderArrowView;
