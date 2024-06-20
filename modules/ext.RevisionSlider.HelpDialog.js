/**
 * Module containing the RevisionSlider tutorial
 *
 * @class HelpDialog
 * @param {Object} config
 * @constructor
 */
function HelpDialog( config ) {
	HelpDialog.super.call( this, config );
}

OO.inheritClass( HelpDialog, OO.ui.ProcessDialog );

HelpDialog.static.title = mw.msg( 'revisionslider-tutorial' );
HelpDialog.static.name = 'revisionslider-tutorial';
HelpDialog.static.actions = [
	{
		action: 'next',
		modes: [ 'initial', 'middle' ],
		label: mw.msg( 'revisionslider-next-dialog' ),
		flags: [ 'primary', 'progressive' ],
		classes: [ 'mw-revslider-help-next' ]
	},
	{
		action: 'previous',
		modes: [ 'middle', 'last' ],
		label: mw.msg( 'revisionslider-previous-dialog' ),
		flags: 'safe',
		classes: [ 'mw-revslider-help-previous' ]
	},
	{
		modes: 'initial',
		label: mw.msg( 'revisionslider-close-dialog' ),
		flags: 'safe',
		classes: [ 'mw-revslider-help-close-start' ]
	},
	{
		modes: 'last',
		label: mw.msg( 'revisionslider-close-dialog' ),
		flags: 'primary',
		classes: [ 'mw-revslider-help-close-end' ]
	}
];

Object.assign( HelpDialog.prototype, {
	/**
	 * @type {OO.ui.PanelLayout[]}
	 */
	slides: [],

	/**
	 * @type {number}
	 */
	slidePointer: 0,

	initialize: function () {
		HelpDialog.super.prototype.initialize.call( this );

		this.slides = [ this.getSlide1(), this.getSlide2(), this.getSlide3(), this.getSlide4() ];

		this.stackLayout = new OO.ui.StackLayout( {
			items: this.slides
		} );

		this.$body.append( this.stackLayout.$element );
	},

	/**
	 * @return {OO.ui.PanelLayout}
	 */
	getSlide1: function () {
		const slide = new OO.ui.PanelLayout( { $: this.$, padded: true, expanded: false } );

		slide.$element.append(
			$( '<div>' ).addClass( 'mw-revslider-help-dialog-image-landscape mw-revslider-help-dialog-slide-1' ),
			$( '<p>' ).addClass( 'mw-revslider-help-dialog-text' )
				.append( mw.message( 'revisionslider-help-dialog-slide1' ).parseDom() )
		);

		slide.$element.find( 'a' ).attr( 'target', '_blank' );

		return slide;
	},

	/**
	 * @return {OO.ui.PanelLayout}
	 */
	getSlide2: function () {
		const slide = new OO.ui.PanelLayout( { $: this.$, padded: true, expanded: false } );

		slide.$element.append(
			$( '<div>' ).addClass( 'mw-revslider-help-dialog-image-landscape mw-revslider-help-dialog-slide-2' ),
			$( '<p>' ).addClass( 'mw-revslider-help-dialog-text' )
				.text( mw.msg( 'revisionslider-help-dialog-slide2' ) )
		);

		return slide;
	},

	/**
	 * @return {OO.ui.PanelLayout}
	 */
	getSlide3: function () {
		const slide = new OO.ui.PanelLayout( { $: this.$, padded: true, expanded: false } );

		slide.$element.append(
			$( '<div>' ).addClass( 'mw-revslider-help-dialog-image-portrait mw-revslider-help-dialog-slide-3a mw-revslider-column-image' ),
			$( '<div>' ).addClass( 'mw-revslider-column-text mw-revslider-help-dialog-text' )
				.text( mw.msg( 'revisionslider-help-dialog-slide3a' ) ),
			$( '<div>' ).css( 'clear', 'both' )
		);

		return slide;
	},

	/**
	 * @return {OO.ui.PanelLayout}
	 */
	getSlide4: function () {
		const slide = new OO.ui.PanelLayout( { $: this.$, padded: true, expanded: false } );

		slide.$element.append(
			$( '<div>' ).addClass( 'mw-revslider-help-dialog-image-landscape mw-revslider-help-dialog-slide-4a' ),
			$( '<p>' ).addClass( 'mw-revslider-help-dialog-text' )
				.text( mw.msg( 'revisionslider-help-dialog-slide4' ) )
		);

		return slide;
	},

	/**
	 * @param {string} action
	 * @return {OO.ui.Process}
	 */
	getActionProcess: function ( action ) {
		if ( action === 'next' ) {
			this.stackLayout.setItem( this.slides[ ++this.slidePointer ] );
		} else if ( action === 'previous' ) {
			this.stackLayout.setItem( this.slides[ --this.slidePointer ] );
		}

		if ( this.slidePointer === 0 ) {
			this.actions.setMode( 'initial' );
		} else if ( this.slidePointer === this.slides.length - 1 ) {
			this.actions.setMode( 'last' );
		} else {
			this.actions.setMode( 'middle' );
		}

		this.stackLayout.$element.closest( '.oo-ui-window-frame' ).css( 'height', this.getContentHeight() + 'px' );
		return HelpDialog.super.prototype.getActionProcess.call( this, action );
	},

	getSetupProcess: function ( data ) {
		return HelpDialog.super.prototype.getSetupProcess.call( this, data )
			.next( function () {
				this.actions.setMode( 'initial' );
			}, this );
	},

	/**
	 * Needed to set the initial height of the dialog
	 *
	 * @return {number}
	 */
	getBodyHeight: function () {
		return this.slides[ this.slidePointer ].$element.outerHeight( true );
	}
} );

/**
 * Initializes the help dialog
 */
HelpDialog.init = function () {
	const windowManager = new OO.ui.WindowManager();

	$( document.body )
		.append( windowManager.$element )
		.on( 'click', ( event ) => {
			if ( $( event.target ).hasClass( 'mw-revslider-help-dialog' ) ) {
				HelpDialog.hide();
			}
		} );

	let dialog;
	HelpDialog.show = function () {
		dialog = new HelpDialog( { size: 'medium', classes: [ 'mw-revslider-help-dialog' ] } );
		windowManager.addWindows( [ dialog ] );
		windowManager.openWindow( dialog );
	};

	HelpDialog.hide = function () {
		if ( windowManager.hasWindow( dialog ) ) {
			windowManager.closeWindow( dialog );
		}
	};
};

module.exports = HelpDialog;
