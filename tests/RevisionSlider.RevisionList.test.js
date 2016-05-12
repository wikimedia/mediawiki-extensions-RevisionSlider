( function ( mw ) {
	var RevisionList = mw.libs.revisionSlider.RevisionList,
		Revision = mw.libs.revisionSlider.Revision;

	QUnit.module( 'ext.RevisionSlider.RevisionList' );

	QUnit.test( 'Find biggest Revision', function ( assert ) {
		var revs = new RevisionList( [
			new Revision( { size: 5 } ),
			new Revision( { size: 21 } ),
			new Revision( { size: 13 } )
		] );

		assert.equal( revs.getBiggestChangeSize(), 16 );
	} );

	QUnit.test( 'calculate relative size on init', function ( assert ) {
		var revs = new RevisionList( [
			new Revision( { size: 5 } ),
			new Revision( { size: 21 } ),
			new Revision( { size: 13 } )
		] );

		assert.equal( revs.getRevisions()[ 0 ].getRelativeSize(), 5 );
		assert.equal( revs.getRevisions()[ 1 ].getRelativeSize(), 16 );
		assert.equal( revs.getRevisions()[ 2 ].getRelativeSize(), -8 );
	} );
} )( mediaWiki );
