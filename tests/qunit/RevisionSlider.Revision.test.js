var SliderModule = require( 'ext.RevisionSlider.Slider' ),
	Revision = SliderModule.Revision;

QUnit.module( 'ext.RevisionSlider.Revision' );

QUnit.test( 'create Revision', function ( assert ) {
	var data = {
			size: 5,
			comment: 'hello',
			parsedcomment: '<b>hello</b>',
			timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
			user: 'meh',
			userGender: 'female'
		},
		rev = new Revision( data );

	SliderModule.setUserOffset( 0 );

	assert.strictEqual( rev.getSize(), data.size );
	assert.strictEqual( rev.getComment(), data.comment );
	assert.strictEqual( rev.getParsedComment(), data.parsedcomment );
	assert.strictEqual( rev.getUser(), data.user );
	assert.strictEqual( rev.getUserGender(), 'female' );
	assert.false( rev.isMinor() );

	if ( mw.config.get( 'wgUserLanguage' ) === 'en' ) {
		assert.strictEqual( rev.getFormattedDate(), '26 April 2016 10:27 AM' );
	}
} );

QUnit.test( 'isMinor with minor empty string', function ( assert ) {
	var rev = new Revision( {
		minor: ''
	} );

	assert.true( rev.isMinor() );
} );

QUnit.test( 'isMinor with minor true', function ( assert ) {
	var rev = new Revision( {
		minor: true
	} );

	assert.true( rev.isMinor() );
} );

QUnit.test( 'get and set relative size', function ( assert ) {
	var size = 5,
		rev = new Revision( {} );
	rev.setRelativeSize( size );
	assert.strictEqual( rev.getRelativeSize(), size );
} );

QUnit.revisionSlider.testOrSkip( 'getFormattedDate, offset: 0', function ( assert ) {
	var rev = new Revision( {
		timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
	} );

	SliderModule.setUserOffset( 0 );

	assert.strictEqual( rev.getFormattedDate(), '26 April 2016 10:27 AM' );
}, mw.config.get( 'wgUserLanguage' ) !== 'en' );

QUnit.revisionSlider.testOrSkip( 'getFormattedDate, offset: 120 (treat as hours, +2h)', function ( assert ) {
	var rev = new Revision( {
		timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
	} );

	// Berlin = 120
	SliderModule.setUserOffset( 120 );

	assert.strictEqual( rev.getFormattedDate(), '26 April 2016 12:27 PM' );
}, mw.config.get( 'wgUserLanguage' ) !== 'en' );

QUnit.revisionSlider.testOrSkip( 'getFormattedDate, negative offset: -420 (treat as hours, -7h)', function ( assert ) {
	var rev = new Revision( {
		timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
	} );

	// San Francisco = -420
	SliderModule.setUserOffset( -420 );

	assert.strictEqual( rev.getFormattedDate(), '26 April 2016 3:27 AM' );
}, mw.config.get( 'wgUserLanguage' ) !== 'en' );

QUnit.test( 'hasEmptyComment comment with whitespaces', function ( assert ) {
	var rev = new Revision( {
		comment: '   '
	} );

	assert.true( rev.hasEmptyComment() );
} );

QUnit.test( 'hasEmptyComment comment with chars', function ( assert ) {
	var rev = new Revision( {
		comment: ' comment '
	} );

	assert.false( rev.hasEmptyComment() );
} );

QUnit.test( 'hasEmptyComment comment with unicode chars', function ( assert ) {
	var rev = new Revision( {
		comment: 'ברוכים'
	} );

	assert.false( rev.hasEmptyComment() );
} );
