var SliderModule = require( 'ext.RevisionSlider.Slider' ),
	DiffPage = SliderModule.DiffPage,
	SliderView = SliderModule.SliderView,
	Slider = SliderModule.Slider,
	RevisionList = SliderModule.RevisionList,
	Revision = SliderModule.Revision;

QUnit.module( 'ext.RevisionSlider.DiffPage' );

QUnit.test( 'Push state', function ( assert ) {
	var diffPage = new DiffPage(),
		sliderView = new SliderView( new Slider( new RevisionList( [
			new Revision( { revid: 1, comment: '' } ),
			new Revision( { revid: 3, comment: '' } ),
			new Revision( { revid: 37, comment: '' } )
		] ) )
		);

	mw.config.set( {
		wgDiffOldId: 1,
		wgDiffNewId: 37
	} );
	sliderView.render( $( '<div>' ) );

	var histLength = history.length;

	diffPage.pushState( 3, 37, sliderView );

	assert.strictEqual( history.length, histLength + 1 );
	assert.propEqual(
		history.state,
		{
			diff: 3,
			oldid: 37,
			pointerOlderPos: 1,
			pointerNewerPos: 3,
			sliderPos: NaN
		}
	);
} );
