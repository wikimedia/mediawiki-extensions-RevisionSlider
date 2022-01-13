var SliderModule = require( 'ext.RevisionSlider.Slider' ),
	Slider = SliderModule.Slider,
	SliderView = SliderModule.SliderView,
	Revision = SliderModule.Revision,
	RevisionList = SliderModule.RevisionList,
	startHistoryState, startHref;

QUnit.module( 'ext.RevisionSlider.SliderView' );

QUnit.testStart( function () {
	startHistoryState = history.state;
	startHref = window.location.href;
} );

QUnit.testDone( function () {
	history.replaceState( startHistoryState, 'QUnit', startHref );
} );

QUnit.test( 'render adds the slider view with defined revisions selected', function ( assert ) {
	var $container = $( '<div>' ),
		view = new SliderView( new Slider( new RevisionList( [
			new Revision( { revid: 1, size: 5, comment: 'Comment1', user: 'User1' } ),
			new Revision( { revid: 3, size: 21, comment: 'Comment2', user: 'User2' } ),
			new Revision( { revid: 37, size: 13, comment: 'Comment3', user: 'User3' } )
		] ) ) );

	mw.config.set( {
		wgDiffOldId: 1,
		wgDiffNewId: 37
	} );

	view.render( $container );

	assert.strictEqual( $container.find( '.mw-revslider-revision-slider' ).length, 1 );
	var $revisionOld = $container.find( '.mw-revslider-revision-old' );
	var $revisionNew = $container.find( '.mw-revslider-revision-new' );
	assert.strictEqual( $revisionOld.length, 1 );
	assert.strictEqual( $revisionOld.attr( 'data-revid' ), '1' );
	assert.strictEqual( $revisionNew.length, 1 );
	assert.strictEqual( $revisionNew.attr( 'data-revid' ), '37' );
} );

QUnit.test( 'render throws an exception when no selected revisions provided', function ( assert ) {
	var $container = $( '<div>' ),
		view = new SliderView( new Slider( new RevisionList( [
			new Revision( { revid: 1, size: 5, comment: 'Comment1', user: 'User1' } ),
			new Revision( { revid: 3, size: 21, comment: 'Comment2', user: 'User2' } ),
			new Revision( { revid: 37, size: 13, comment: 'Comment3', user: 'User3' } )
		] ) ) );

	mw.config.set( 'wgDiffOldId', null );
	mw.config.set( 'wgDiffNewId', null );

	assert.throws(
		function () {
			view.render( $container );
		}
	);
} );
