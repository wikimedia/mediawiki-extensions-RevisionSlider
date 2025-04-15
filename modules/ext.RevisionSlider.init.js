const Settings = require( 'ext.RevisionSlider.Settings' ),
	settings = new Settings(),
	SliderModule = require( 'ext.RevisionSlider.Slider' ),
	HelpDialog = SliderModule.HelpDialog,
	RevisionSliderApi = SliderModule.Api,
	Slider = SliderModule.Slider,
	utils = SliderModule.utils,
	toggleButton = OO.ui.ButtonWidget.static.infuse( $( '.mw-revslider-toggle-button' ) );
let autoExpand = settings.shouldAutoExpand();
let expanded = autoExpand;

function initialize() {
	const startTime = mw.now();
	const api = new RevisionSliderApi( mw.util.wikiScript( 'api' ) );

	toggleButton.$element.children().attr( {
		'aria-expanded': autoExpand,
		'aria-controls': 'mw-revslider-slider-wrapper'
	} );

	utils.incrementEventStats( 'init' );
	SliderModule.setUserOffset(
		mw.user.options.get( 'timecorrection' ) ?
			mw.user.options.get( 'timecorrection' ).split( '|' )[ 1 ] :
			mw.config.get( 'extRevisionSliderTimeOffset' )
	);

	HelpDialog.init();

	api.fetchAvailableChangeTags().then( ( data ) => {
		const changeTags = data && data.query && data.query.tags || [];
		api.fetchRevisionData( mw.config.get( 'wgPageName' ), {
			startId: Math.max( mw.config.get( 'wgDiffOldId' ), mw.config.get( 'wgDiffNewId' ) ),
			limit: utils.calculateRevisionsPerWindow( 160, 16 ),
			changeTags: changeTags
		} ).then( ( data2 ) => {
			mw.track( 'timing.MediaWiki.RevisionSlider.timing.initFetchRevisionData', mw.now() - startTime );
			mw.track( 'stats.mediawiki_RevisionSlider_initFetchRevisionData_seconds', mw.now() - startTime );

			try {
				const revs = data2.revisions;
				revs.reverse();

				const $container = $( '.mw-revslider-slider-wrapper' );
				$container.attr( 'id', 'mw-revslider-slider-wrapper' );

				const revisionList = new SliderModule.RevisionList(
					SliderModule.makeRevisions( revs ),
					changeTags
				);

				const slider = new Slider( revisionList );
				slider.getView().render( $container );

				$( window ).on( 'resize', OO.ui.throttle( () => {
					slider.getView().render( $container );
				}, 250 ) );

				if ( !settings.shouldHideHelpDialogue() ) {
					HelpDialog.show();
					settings.setHideHelpDialogue( true );
				}

				$( '.mw-revslider-placeholder' ).remove();
				mw.track( 'timing.MediaWiki.RevisionSlider.timing.init', mw.now() - startTime );
				mw.track( 'stats.mediawiki_RevisionSlider_init_seconds', mw.now() - startTime );
			} catch ( err ) {
				$( '.mw-revslider-placeholder' )
					.text( mw.msg( 'revisionslider-loading-failed' ) );
				mw.log.error( err );
				utils.incrementErrorStats( 'init' );
			}
		}, ( err ) => {
			$( '.mw-revslider-placeholder' )
				.text( mw.msg( 'revisionslider-loading-failed' ) );
			mw.log.error( err );
			utils.incrementErrorStats( 'init' );
		} );
	} );
}

function expand() {
	toggleButton.setTitle( mw.msg( 'revisionslider-toggle-title-collapse' ) );
	$( '.mw-revslider-container' ).removeClass( 'mw-revslider-container-collapsed' )
		.addClass( 'mw-revslider-container-expanded' );
	$( '.mw-revslider-slider-wrapper, .mw-revslider-auto-expand-button' ).show();
	toggleButton.$element.children().attr( 'aria-expanded', 'true' );
	expanded = true;
}

function collapse() {
	toggleButton.setTitle( mw.msg( 'revisionslider-toggle-title-expand' ) );
	$( '.mw-revslider-container' ).removeClass( 'mw-revslider-container-expanded' )
		.addClass( 'mw-revslider-container-collapsed' );
	$( '.mw-revslider-slider-wrapper, .mw-revslider-auto-expand-button' ).hide();
	toggleButton.$element.children().attr( 'aria-expanded', 'false' );
}

const autoExpandButton = new OO.ui.ToggleButtonWidget( {
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
			utils.incrementEventStats( 'autoexpand_on' );
		} else {
			autoExpandButton.setTitle( mw.msg( 'revisionslider-turn-on-auto-expand-title' ) );
			autoExpandButton.$element.children().attr(
				'aria-label', mw.msg( 'revisionslider-turn-on-auto-expand-title' )
			);
			utils.incrementEventStats( 'autoexpand_off' );
		}
	}
} );

$( '.mw-revslider-container' ).append( autoExpandButton.$element );

toggleButton.connect( this, {
	click: function () {
		expanded = !expanded;
		if ( expanded ) {
			expand();
			utils.incrementEventStats( 'expand' );
		} else {
			collapse();
			utils.incrementEventStats( 'collapse' );
		}
	}
} );

expand();
initialize();
