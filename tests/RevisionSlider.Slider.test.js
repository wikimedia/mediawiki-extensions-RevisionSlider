( function ( mw ) {
	var Slider = mw.libs.revisionSlider.Slider,
		RevisionList = mw.libs.revisionSlider.RevisionList,
		Revision = mw.libs.revisionSlider.Revision,
		makeNRevisions = function ( n ) {
			var revs = [],
				i;
			for ( i = 0; i < n; i++ ) {
				revs.push( new Revision( { user: 'Fooo' } ) );
			}
			return new RevisionList( revs );
		};

	QUnit.module( 'ext.RevisionSlider.Slider' );

	QUnit.test( 'has revisions', function ( assert ) {
		var revs = new RevisionList( [ new Revision( {} ), new Revision( {} ) ] ),
			slider = new Slider( revs );

		assert.equal( slider.getRevisions(), revs );
	} );

	QUnit.test( 'Given no revisions, first visible revision index is 0', function ( assert ) {
		var slider = new Slider( makeNRevisions( 0 ) );

		assert.equal( slider.getFirstVisibleRevisionIndex(), 0 );
	} );

	QUnit.test( 'Given 200 revisions sliding once increases firstVisibleRevisionIndex by the number of revisions per window', function ( assert ) {
		var slider = new Slider( makeNRevisions( 200 ) );
		slider.setRevisionsPerWindow( 50 );
		slider.slide( 1 );

		assert.equal( slider.getFirstVisibleRevisionIndex(), 50 );
	} );

	QUnit.test( 'firstVisibleRevisionIndex cannot be higher than revisions.length - revisionsPerWindow', function ( assert ) {
		var slider = new Slider( makeNRevisions( 75 ) );
		slider.setRevisionsPerWindow( 50 );
		slider.slide( 1 );

		assert.equal( slider.getFirstVisibleRevisionIndex(), 25 );
	} );

	QUnit.test( 'firstVisibleRevisionIndex cannot be lower than 0', function ( assert ) {
		var slider = new Slider( makeNRevisions( 50 ) );
		slider.firstVisibleRevisionIndex = 10;
		slider.setRevisionsPerWindow( 20 );
		slider.slide( -1 );

		assert.equal( slider.getFirstVisibleRevisionIndex(), 0 );
	} );

} )( mediaWiki );
