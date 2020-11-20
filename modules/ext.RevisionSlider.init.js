var Settings = require( 'ext.RevisionSlider.Settings' ),
	settings = new Settings(),
	SliderModule = require( 'ext.RevisionSlider.Slider' ),
	HelpDialog = SliderModule.HelpDialog,
	RevisionSliderApi = SliderModule.Api,
	Slider = SliderModule.Slider,
	utils = SliderModule.utils,
	autoExpand = settings.shouldAutoExpand(),
	expanded = autoExpand,
	toggleButton = OO.ui.ButtonWidget.static.infuse( $( '.mw-revslider-toggle-button' ) );

function initialize() {
	var startTime = mw.now(),
		api = new RevisionSliderApi( mw.util.wikiScript( 'api' ) ),
		changeTags = [];

	toggleButton.$element.children().attr( {
		'aria-expanded': autoExpand,
		'aria-controls': 'mw-revslider-slider-wrapper'
	} );

	mw.track( 'counter.MediaWiki.RevisionSlider.event.init' );
	SliderModule.setUserOffset(
		mw.user.options.get( 'timecorrection' ) ?
			mw.user.options.get( 'timecorrection' ).split( '|' )[ 1 ] :
			mw.config.get( 'extRevisionSliderTimeOffset' )
	);

	HelpDialog.init();

	api.fetchAvailableChangeTags().then( function ( data ) {
		if ( typeof data === 'object' &&
			data.query &&
			data.query.tags &&
			data.query.tags.length > 0
		) {
			changeTags = data.query.tags;
		}
		api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
			startId: mw.config.get( 'wgDiffNewId' ),
			limit: utils.calculateRevisionsPerWindow( 160, 16 ),
			changeTags: changeTags
		} ).then( function ( data2 ) {
			mw.track( 'timing.MediaWiki.RevisionSlider.timing.initFetchRevisionData', mw.now() - startTime );

			try {
				var revs = data2.revisions;
				revs.reverse();

				var $container = $( '.mw-revslider-slider-wrapper' );
				$container.attr( 'id', 'mw-revslider-slider-wrapper' );

				var revisionList = new SliderModule.RevisionList(
					SliderModule.makeRevisions( revs ),
					changeTags
				);
				revisionList.getView().setDir( $container.css( 'direction' ) || 'ltr' );

				var slider = new Slider( revisionList );
				slider.getView().render( $container );

				$( window ).on( 'resize', OO.ui.throttle( function () {
					slider.getView().render( $container );
				}, 250 ) );

				if ( !settings.shouldHideHelpDialogue() ) {
					HelpDialog.show();
					settings.setHideHelpDialogue( true );
				}

				$( '.mw-revslider-placeholder' ).remove();
				mw.track( 'timing.MediaWiki.RevisionSlider.timing.init', mw.now() - startTime );
			} catch ( err ) {
				$( '.mw-revslider-placeholder' )
					.text( mw.message( 'revisionslider-loading-failed' ).text() );
				mw.log.error( err );
				mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
			}
		}, function ( err ) {
			$( '.mw-revslider-placeholder' )
				.text( mw.message( 'revisionslider-loading-failed' ).text() );
			mw.log.error( err );
			mw.track( 'counter.MediaWiki.RevisionSlider.error.init' );
		} );
	} );
}

function expand() {
	toggleButton.setTitle( mw.message( 'revisionslider-toggle-title-collapse' ).text() );
	$( '.mw-revslider-container' ).removeClass( 'mw-revslider-container-collapsed' )
		.addClass( 'mw-revslider-container-expanded' );
	$( '.mw-revslider-slider-wrapper' ).show();
	$( '.mw-revslider-auto-expand-button' ).show();
	toggleButton.$element.children().attr( 'aria-expanded', 'true' );
	expanded = true;
}

function collapse() {
	toggleButton.setTitle( mw.message( 'revisionslider-toggle-title-expand' ).text() );
	$( '.mw-revslider-container' ).removeClass( 'mw-revslider-container-expanded' )
		.addClass( 'mw-revslider-container-collapsed' );
	$( '.mw-revslider-slider-wrapper' ).hide();
	$( '.mw-revslider-auto-expand-button' ).hide();
	toggleButton.$element.children().attr( 'aria-expanded', 'false' );
}

var autoExpandButton = new OO.ui.ToggleButtonWidget( {
	icon: 'pushPin',
	classes: [ 'mw-revslider-auto-expand-button' ],
	title: mw.msg( autoExpand ?
		'revisionslider-turn-off-auto-expand-title' :
		'revisionslider-turn-on-auto-expand-title'
	),
	value: autoExpand
} );

autoExpandButton.$element.children().attr(
	'aria-label',
	mw.msg( autoExpand ?
		'revisionslider-turn-off-auto-expand-title' :
		'revisionslider-turn-on-auto-expand-title'
	)
);

autoExpandButton.connect( this, {
	click: function () {
		autoExpand = !autoExpand;
		settings.setAutoExpand( autoExpand );
		if ( autoExpand ) {
			autoExpandButton.setTitle( mw.msg( 'revisionslider-turn-off-auto-expand-title' ) );
			autoExpandButton.$element.children().attr(
				'aria-label', mw.msg( 'revisionslider-turn-off-auto-expand-title' )
			);
			expand();
			mw.track( 'counter.MediaWiki.RevisionSlider.event.autoexpand_on' );
		} else {
			autoExpandButton.setTitle( mw.msg( 'revisionslider-turn-on-auto-expand-title' ) );
			autoExpandButton.$element.children().attr(
				'aria-label', mw.msg( 'revisionslider-turn-on-auto-expand-title' )
			);
			mw.track( 'counter.MediaWiki.RevisionSlider.event.autoexpand_off' );
		}
	}
} );

$( '.mw-revslider-container' ).append( autoExpandButton.$element );

toggleButton.connect( this, {
	click: function () {
		expanded = !expanded;
		if ( expanded ) {
			expand();
			mw.track( 'counter.MediaWiki.RevisionSlider.event.expand' );
			mw.hook( 'revslider.expand' ).fire();
		} else {
			collapse();
			mw.track( 'counter.MediaWiki.RevisionSlider.event.collapse' );
			mw.hook( 'revslider.collapse' ).fire();
		}
	}
} );

expand();
initialize();
