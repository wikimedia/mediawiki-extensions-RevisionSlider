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

		mw.config.values.extRevisionSliderTimeOffset = 0;
		mw.user.options.values.timecorrection = 0;

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

		mw.config.values.extRevisionSliderTimeOffset = 0;
		mw.user.options.values.timecorrection = 0;

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

		mw.config.values.extRevisionSliderTimeOffset = 0;
		mw.user.options.values.timecorrection = 0;

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

	QUnit.test( 'getFormattedDate No user offset, 0 default offset', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		mw.user.options.values.timecorrection = undefined;
		mw.config.values.extRevisionSliderTimeOffset = 0;

		assert.equal( rev.getFormattedDate(), '10:27, 26 Apr 2016' );
	} );

	QUnit.test( 'getFormattedDate No user offset, 1 default offset', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		mw.user.options.values.timecorrection = undefined;
		mw.config.values.extRevisionSliderTimeOffset = 60;

		assert.equal( rev.getFormattedDate(), '11:27, 26 Apr 2016' );
	} );

	QUnit.test( 'getFormattedDate 2 user offset, 1 default offset', function ( assert ) {
		var rev = new mw.libs.revisionSlider.Revision( {
				timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
			} );

		mw.user.options.values.timecorrection = 'FOO|120|BAR';
		mw.config.values.extRevisionSliderTimeOffset = 60;

		assert.equal( rev.getFormattedDate(), '12:27, 26 Apr 2016' );
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

