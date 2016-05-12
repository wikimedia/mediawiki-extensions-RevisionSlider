( function ( mw ) {
	var SliderView = mw.libs.revisionSlider.SliderView,
		Slider = mw.libs.revisionSlider.Slider,
		Revision = mw.libs.revisionSlider.Revision,
		RevisionList = mw.libs.revisionSlider.RevisionList,
		startHistoryState, startHref;

	QUnit.module( 'ext.RevisionSlider.SliderView' );

	QUnit.testStart( function () {
		startHistoryState = history.state;
		startHref = window.location.href;
	} );

	QUnit.testDone( function () {
		history.replaceState( startHistoryState, 'QUnit', startHref );
	} );

	QUnit.test( 'render', function ( assert ) {
		var $container = $( '<div/>' ),
			view = new SliderView( new Slider( new RevisionList( [
				new Revision( { size: 5, comment: 'Comment1', user: 'User1' } ),
				new Revision( { size: 21, comment: 'Comment2', user: 'User2' } ),
				new Revision( { size: 13, comment: 'Comment3', user: 'User3' } )
			] ) ) );

		view.render( $container );
		assert.ok( $container.find( '.revision-slider' ).length > 0 );
	} );

} )( mediaWiki );
