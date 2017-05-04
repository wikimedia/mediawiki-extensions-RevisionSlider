( function ( mw, $ ) {
	/**
	 * Module containing presentation logic for the helper button
	 */
	var HelpButtonView = {

		/**
		 * Renders the help button and renders and adds the popup for it.
		 *
		 * @return {jQuery} the help button object
		 */
		render: function () {
			var helpButton, helpPopup;

			helpButton = new OO.ui.ButtonWidget( {
				icon: 'help',
				framed: false,
				classes: [ 'mw-revslider-show-help' ]
			} );
			helpPopup = new OO.ui.PopupWidget( {
				$content: $( '<p>' ).text( mw.msg( 'revisionslider-show-help-tooltip' ) ),
				$floatableContainer: helpButton.$element,
				padded: true,
				width: 200,
				classes: [ 'mw-revslider-tooltip', 'mw-revslider-help-tooltip' ]
			} );
			helpButton.$element
				.click( function () {
					mw.libs.revisionSlider.HelpDialog.show();
				} )
				.mouseover( function () {
					helpPopup.toggle( true );
				} )
				.mouseout( function () {
					helpPopup.toggle( false );
				} );

			$( 'body' ).append( helpPopup.$element );

			return helpButton.$element;
		}
	};

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.HelpButtonView = HelpButtonView;
}( mediaWiki, jQuery ) );
