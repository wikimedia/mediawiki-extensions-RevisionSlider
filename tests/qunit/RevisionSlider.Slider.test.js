( function () {
	const SliderModule = require( 'ext.RevisionSlider.Slider' ),
		Slider = SliderModule.Slider,
		Revision = SliderModule.Revision,
		RevisionList = SliderModule.RevisionList;

	function makeNRevisions( n ) {
		const revs = [];
		for ( let i = 0; i < n; i++ ) {
			revs.push( new Revision( { revid: i + 1, user: 'Fooo' } ) );
		}
		return new RevisionList( revs );
	}

	QUnit.module( 'ext.RevisionSlider.Slider' );

	QUnit.test( 'has revisions', ( assert ) => {
		const revs = new RevisionList( [
				new Revision( { revid: 1 } ),
				new Revision( { revid: 2 } )
			] ),
			slider = new Slider( revs );

		assert.strictEqual( slider.getRevisionList(), revs );
	} );

	QUnit.test( 'Given no revisions, first visible revision index is 0', ( assert ) => {
		const slider = new Slider( makeNRevisions( 0 ) );

		assert.strictEqual( slider.getOldestVisibleRevisionIndex(), 0 );
	} );

	QUnit.test( 'Given 200 revisions sliding once increases oldestVisibleRevisionIndex by the number of revisions per window', ( assert ) => {
		const slider = new Slider( makeNRevisions( 200 ) );
		slider.setRevisionsPerWindow( 49.999 );
		slider.slide( 1 );

		assert.strictEqual( slider.getOldestVisibleRevisionIndex(), 50 );
	} );

	QUnit.test( 'oldestVisibleRevisionIndex cannot be higher than revisions.length - revisionsPerWindow', ( assert ) => {
		const slider = new Slider( makeNRevisions( 75 ) );
		slider.setRevisionsPerWindow( 50 );
		slider.slide( 1 );

		assert.strictEqual( slider.getOldestVisibleRevisionIndex(), 25 );
	} );

	QUnit.test( 'oldestVisibleRevisionIndex cannot be lower than 0', ( assert ) => {
		const slider = new Slider( makeNRevisions( 50 ) );
		slider.oldestVisibleRevisionIndex = 10;
		slider.setRevisionsPerWindow( 20 );
		slider.slide( -1 );

		assert.strictEqual( slider.getOldestVisibleRevisionIndex(), 0 );
	} );
}() );
