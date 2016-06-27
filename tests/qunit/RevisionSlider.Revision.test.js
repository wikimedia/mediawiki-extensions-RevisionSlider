( function ( mw ) {
	QUnit.module( 'ext.RevisionSlider.Revision' );

	QUnit.test( 'create Revision', function ( assert ) {
		var data = {
				size: 5,
				comment: 'hello',
				parsedcomment: '<b>hello</b>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'meh'
			},
			rev = new mw.libs.revisionSlider.Revision( data );

		mw.libs.revisionSlider.userOffset = 0;

		assert.equal( rev.getSize(), data.size );
		assert.equal( rev.getComment(), data.comment );
		assert.equal( rev.getParsedComment(), data.parsedcomment );
		assert.equal( rev.getFormattedDate(), '10:27, 26 Apr 2016' );
		assert.equal( rev.getUser(), data.user );
		assert.equal( rev.isMinor(), false );
	} );

	QUnit.test( 'create minor Revision (minor empty string)', function ( assert ) {
		var data = {
				size: 5,
				comment: 'hello',
				parsedcomment: '<b>hello</b>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'meh',
				minor: ''
			},
			rev = new mw.libs.revisionSlider.Revision( data );

		mw.libs.revisionSlider.userOffset = 0;

		assert.equal( rev.getSize(), data.size );
		assert.equal( rev.getComment(), data.comment );
		assert.equal( rev.getParsedComment(), data.parsedcomment );
		assert.equal( rev.getFormattedDate(), '10:27, 26 Apr 2016' );
		assert.equal( rev.getUser(), data.user );
		assert.equal( rev.isMinor(), true );
	} );

	QUnit.test( 'create minor Revision (minor true, as if from another Revision object)', function ( assert ) {
		var data = {
				size: 5,
				comment: 'hello',
				parsedcomment: '<b>hello</b>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'meh',
				minor: true
			},
			rev = new mw.libs.revisionSlider.Revision( data );

		mw.libs.revisionSlider.userOffset = 0;

		assert.equal( rev.getSize(), data.size );
		assert.equal( rev.getComment(), data.comment );
		assert.equal( rev.getParsedComment(), data.parsedcomment );
		assert.equal( rev.getFormattedDate(), '10:27, 26 Apr 2016' );
		assert.equal( rev.getUser(), data.user );
		assert.equal( rev.isMinor(), true );
	} );

	QUnit.test( 'get and set relative size', function ( assert ) {
		var size = 5,
			rev = new mw.libs.revisionSlider.Revision( {} );
		rev.setRelativeSize( size );
		assert.equal( rev.getRelativeSize(), size );
	} );

	QUnit.test( 'getFormattedDate, offset: 0', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		mw.libs.revisionSlider.userOffset = 0;

		assert.equal( rev.getFormattedDate(), '10:27, 26 Apr 2016' );
	} );

	QUnit.test( 'getFormattedDate, offset: 120 (treat as hours, +2h)', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		// Berlin = 120
		mw.libs.revisionSlider.userOffset = 120;

		assert.equal( rev.getFormattedDate(), '12:27, 26 Apr 2016' );
	} );

	QUnit.test( 'getFormattedDate, negative offset: -420 (treat as hours, -7h)', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		// San Francisco = -420
		mw.libs.revisionSlider.userOffset = -420;

		assert.equal( rev.getFormattedDate(), '03:27, 26 Apr 2016' );
	} );

	QUnit.test( 'hasEmptyComment comment with whitespaces', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
			comment: '   '
		} );

		assert.ok( rev.hasEmptyComment() );
	} );

	QUnit.test( 'hasEmptyComment comment with chars', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
			comment: ' comment '
		} );

		assert.notOk( rev.hasEmptyComment() );
	} );

	QUnit.test( 'hasEmptyComment comment with unicode chars', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
			comment: 'ברוכים'
		} );

		assert.notOk( rev.hasEmptyComment() );
	} );

} )( mediaWiki );

