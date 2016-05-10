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
} )( mediaWiki );
