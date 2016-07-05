( function ( mw ) {
	var Revision = mw.libs.revisionSlider.Revision,
		RevisionList = mw.libs.revisionSlider.RevisionList,
		makeRevisions = mw.libs.revisionSlider.makeRevisions;

	QUnit.module( 'ext.RevisionSlider.RevisionList' );

	QUnit.test( 'Find biggest Revision', function ( assert ) {
		var revs = new RevisionList( [
			new Revision( { revid: 1, size: 5 } ),
			new Revision( { revid: 2, size: 21 } ),
			new Revision( { revid: 3, size: 13 } )
		] );

		assert.equal( revs.getBiggestChangeSize(), 16 );
	} );

	QUnit.test( 'calculate relative size on init', function ( assert ) {
		var revs = new RevisionList( [
			new Revision( { revid: 1, size: 5 } ),
			new Revision( { revid: 2, size: 21 } ),
			new Revision( { revid: 3, size: 13 } )
		] );

		assert.equal( revs.getRevisions()[ 0 ].getRelativeSize(), 5 );
		assert.equal( revs.getRevisions()[ 1 ].getRelativeSize(), 16 );
		assert.equal( revs.getRevisions()[ 2 ].getRelativeSize(), -8 );
	} );

	QUnit.test( 'makeRevisions converts revision data into list of Revision objects', function ( assert ) {
		var revs = [
			{ revid: 1, size: 5 },
			{ revid: 2, size: 21 },
			{ revid: 3, size: 13 }
		],
			revisions = makeRevisions( revs );

		assert.equal( revisions[ 0 ].getId(), 1 );
		assert.equal( revisions[ 0 ].getSize(), 5 );
		assert.equal( revisions[ 1 ].getId(), 2 );
		assert.equal( revisions[ 1 ].getSize(), 21 );
		assert.equal( revisions[ 2 ].getId(), 3 );
		assert.equal( revisions[ 2 ].getSize(), 13 );
	} );
} )( mediaWiki );
