( function () {
	const SliderModule = require( 'ext.RevisionSlider.Slider' ),
		Revision = SliderModule.Revision,
		RevisionList = SliderModule.RevisionList,
		makeRevisions = SliderModule.makeRevisions;

	QUnit.module( 'ext.RevisionSlider.RevisionList' );

	QUnit.test( 'Find biggest Revision', ( assert ) => {
		const revs = new RevisionList( [
			new Revision( { revid: 1, size: 5 } ),
			new Revision( { revid: 2, size: 21 } ),
			new Revision( { revid: 3, size: 13 } )
		] );

		assert.strictEqual( revs.getBiggestChangeSize(), 16 );
	} );

	QUnit.test( 'calculate relative size on init', ( assert ) => {
		const revs = new RevisionList( [
			new Revision( { revid: 1, size: 5 } ),
			new Revision( { revid: 2, size: 21 } ),
			new Revision( { revid: 3, size: 13 } )
		] );

		assert.strictEqual( revs.getRevisions()[ 0 ].getRelativeSize(), 5 );
		assert.strictEqual( revs.getRevisions()[ 1 ].getRelativeSize(), 16 );
		assert.strictEqual( revs.getRevisions()[ 2 ].getRelativeSize(), -8 );
	} );

	QUnit.test( 'getUserGenders', ( assert ) => {
		const revs = new RevisionList( [
			new Revision( { revid: 1, user: 'User1', userGender: 'female' } ),
			new Revision( { revid: 2, user: 'User2' } ),
			new Revision( { revid: 3, user: 'User3', userGender: 'male' } )
		] );

		assert.deepEqual( revs.getUserGenders(), { User1: 'female', User2: '', User3: 'male' } );
	} );

	QUnit.test( 'Push appends revisions to the end of the list', ( assert ) => {
		const list = new RevisionList( [
			new Revision( { revid: 1, size: 5 } ),
			new Revision( { revid: 2, size: 21 } ),
			new Revision( { revid: 3, size: 13 } )
		] );
		list.push( [
			new Revision( { revid: 6, size: 19 } ),
			new Revision( { revid: 8, size: 25 } )
		] );

		const revisions = list.getRevisions();
		assert.strictEqual( list.getLength(), 5 );
		assert.strictEqual( revisions[ 0 ].getId(), 1 );
		assert.strictEqual( revisions[ 0 ].getRelativeSize(), 5 );
		assert.strictEqual( revisions[ 1 ].getId(), 2 );
		assert.strictEqual( revisions[ 1 ].getRelativeSize(), 16 );
		assert.strictEqual( revisions[ 2 ].getId(), 3 );
		assert.strictEqual( revisions[ 2 ].getRelativeSize(), -8 );
		assert.strictEqual( revisions[ 3 ].getId(), 6 );
		assert.strictEqual( revisions[ 3 ].getRelativeSize(), 6 );
		assert.strictEqual( revisions[ 4 ].getId(), 8 );
		assert.strictEqual( revisions[ 4 ].getRelativeSize(), 6 );
	} );

	QUnit.test( 'Unshift prepends revisions to the beginning of the list', ( assert ) => {
		const list = new RevisionList( [
			new Revision( { revid: 5, size: 5 } ),
			new Revision( { revid: 6, size: 21 } ),
			new Revision( { revid: 7, size: 13 } )
		] );
		list.unshift( [
			new Revision( { revid: 2, size: 19 } ),
			new Revision( { revid: 4, size: 25 } )
		] );

		const revisions = list.getRevisions();
		assert.strictEqual( list.getLength(), 5 );
		assert.strictEqual( revisions[ 0 ].getId(), 2 );
		assert.strictEqual( revisions[ 0 ].getRelativeSize(), 19 );
		assert.strictEqual( revisions[ 1 ].getId(), 4 );
		assert.strictEqual( revisions[ 1 ].getRelativeSize(), 6 );
		assert.strictEqual( revisions[ 2 ].getId(), 5 );
		assert.strictEqual( revisions[ 2 ].getRelativeSize(), -20 );
		assert.strictEqual( revisions[ 3 ].getId(), 6 );
		assert.strictEqual( revisions[ 3 ].getRelativeSize(), 16 );
		assert.strictEqual( revisions[ 4 ].getId(), 7 );
		assert.strictEqual( revisions[ 4 ].getRelativeSize(), -8 );
	} );

	QUnit.test( 'Unshift considers the size of the preceding revision if specified', ( assert ) => {
		const list = new RevisionList( [
			new Revision( { revid: 5, size: 5 } ),
			new Revision( { revid: 6, size: 21 } ),
			new Revision( { revid: 7, size: 13 } )
		] );
		list.unshift(
			[
				new Revision( { revid: 2, size: 19 } ),
				new Revision( { revid: 4, size: 25 } )
			],
			12
		);

		const revisions = list.getRevisions();
		assert.strictEqual( list.getLength(), 5 );
		assert.strictEqual( revisions[ 0 ].getId(), 2 );
		assert.strictEqual( revisions[ 0 ].getRelativeSize(), 7 );
	} );

	QUnit.test( 'Slice returns a subset of the list', ( assert ) => {
		const list = new RevisionList( [
				new Revision( { revid: 1, size: 5 } ),
				new Revision( { revid: 2, size: 21 } ),
				new Revision( { revid: 3, size: 13 } ),
				new Revision( { revid: 6, size: 19 } ),
				new Revision( { revid: 8, size: 25 } )
			] ),
			slicedList = list.slice( 1, 3 ),
			revisions = slicedList.getRevisions();

		assert.strictEqual( slicedList.getLength(), 2 );
		assert.strictEqual( revisions[ 0 ].getId(), 2 );
		assert.strictEqual( revisions[ 0 ].getRelativeSize(), 16 );
		assert.strictEqual( revisions[ 1 ].getId(), 3 );
		assert.strictEqual( revisions[ 1 ].getRelativeSize(), -8 );
	} );

	QUnit.test( 'Slice returns a subset of the list, end param omitted', ( assert ) => {
		const list = new RevisionList( [
				new Revision( { revid: 1, size: 5 } ),
				new Revision( { revid: 2, size: 21 } ),
				new Revision( { revid: 3, size: 13 } ),
				new Revision( { revid: 6, size: 19 } ),
				new Revision( { revid: 8, size: 25 } )
			] ),
			slicedList = list.slice( 1 ),
			revisions = slicedList.getRevisions();

		assert.strictEqual( slicedList.getLength(), 4 );
		assert.strictEqual( revisions[ 0 ].getId(), 2 );
		assert.strictEqual( revisions[ 1 ].getId(), 3 );
		assert.strictEqual( revisions[ 2 ].getId(), 6 );
		assert.strictEqual( revisions[ 3 ].getId(), 8 );
	} );

	QUnit.test( 'makeRevisions converts revision data into list of Revision objects', ( assert ) => {
		const revs = [
				{ revid: 1, size: 5, userGender: 'female' },
				{ revid: 2, size: 21, userGender: 'unknown' },
				{ revid: 3, size: 13 }
			],
			revisions = makeRevisions( revs );

		assert.strictEqual( revisions[ 0 ].getId(), 1 );
		assert.strictEqual( revisions[ 0 ].getSize(), 5 );
		assert.strictEqual( revisions[ 1 ].getId(), 2 );
		assert.strictEqual( revisions[ 1 ].getSize(), 21 );
		assert.strictEqual( revisions[ 2 ].getId(), 3 );
		assert.strictEqual( revisions[ 2 ].getSize(), 13 );
	} );
}() );
