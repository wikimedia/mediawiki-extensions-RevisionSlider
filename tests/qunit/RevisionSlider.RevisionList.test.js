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

	QUnit.test( 'getUserNames returns a list of unique names', function ( assert ) {
		var revs = new RevisionList( [
			new Revision( { revid: 1, user: 'User1' } ),
			new Revision( { revid: 2, user: 'User2' } ),
			new Revision( { revid: 3, user: 'User1' } )
		] ),
			userNames = revs.getUserNames();

		assert.deepEqual( userNames, [ 'User1', 'User2' ] );
	} );

	QUnit.test( 'getUserNames skips revisions without user specified', function ( assert ) {
		var revs = new RevisionList( [
				new Revision( { revid: 1, user: 'User1' } ),
				new Revision( { revid: 2 } )
			] ),
			userNames = revs.getUserNames();

		assert.deepEqual( userNames, [ 'User1' ] );
	} );

	QUnit.test( 'setUserGenders adjusts revision data', function ( assert ) {
		var revs = new RevisionList( [
				new Revision( { revid: 1, user: 'User1' } ),
				new Revision( { revid: 2, user: 'User2' } ),
				new Revision( { revid: 3, user: 'User3' } )
			] ),
			genders = { User1: 'female', User2: 'male', User3: 'unknown' };

		assert.equal( revs.getRevisions()[ 0 ].getUserGender(), '' );
		assert.equal( revs.getRevisions()[ 1 ].getUserGender(), '' );
		assert.equal( revs.getRevisions()[ 2 ].getUserGender(), '' );

		revs.setUserGenders( genders );

		assert.equal( revs.getRevisions()[ 0 ].getUserGender(), 'female' );
		assert.equal( revs.getRevisions()[ 1 ].getUserGender(), 'male' );
		assert.equal( revs.getRevisions()[ 2 ].getUserGender(), 'unknown' );
	} );

	QUnit.test( 'setUserGenders no gender for a user', function ( assert ) {
		var revs = new RevisionList( [
				new Revision( { revid: 1, user: 'User1' } ),
				new Revision( { revid: 2, user: 'User2' } )
			] ),
			genders = { User1: 'female' };

		assert.equal( revs.getRevisions()[ 0 ].getUserGender(), '' );
		assert.equal( revs.getRevisions()[ 1 ].getUserGender(), '' );

		revs.setUserGenders( genders );

		assert.equal( revs.getRevisions()[ 0 ].getUserGender(), 'female' );
		assert.equal( revs.getRevisions()[ 1 ].getUserGender(), '' );
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
