QUnit.module( 'ext.RevisionSlider.DiffPage' );

QUnit.test( 'Push state', () => {
	const SliderModule = require( 'ext.RevisionSlider.Slider' ),
		DiffPage = SliderModule.DiffPage;

	const historyStub = { pushState: sinon.spy() };
	const sliderStub = { getOldestVisibleRevisionIndex: sinon.stub().returns( 42 ) };
	const pointerStub = { getPosition: sinon.stub().returns( 5 ) };
	const sliderViewStub = {
		pointerOlder: pointerStub,
		pointerNewer: pointerStub,
		slider: sliderStub
	};
	const diffPage = new DiffPage( historyStub );

	mw.config.set( {
		wgDiffOldId: 1,
		wgDiffNewId: 37
	} );

	diffPage.pushState( 3, 37, sliderViewStub );

	sinon.assert.calledWith(
		historyStub.pushState,
		{ diff: 3, oldid: 37, pointerNewerPos: 5, pointerOlderPos: 5, sliderPos: 42 },
		sinon.match.any,
		sinon.match.any
	);

	sinon.assert.calledOnce( sliderStub.getOldestVisibleRevisionIndex );
	sinon.assert.calledTwice( pointerStub.getPosition );
} );
