QUnit.module( 'ext.RevisionSlider.Revision', () => {
	const SliderModule = require( 'ext.RevisionSlider.Slider' ),
		Revision = SliderModule.Revision;

	QUnit.test( 'create Revision', ( assert ) => {
		const data = {
				size: 5,
				parsedcomment: '<b>hello</b>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'meh',
				userGender: 'female'
			},
			rev = new Revision( data );

		assert.strictEqual( rev.getSize(), data.size );
		assert.strictEqual( rev.getParsedComment(), data.parsedcomment );
		assert.strictEqual( rev.getUser(), data.user );
		assert.strictEqual( rev.getUserGender(), 'female' );
		assert.false( rev.isMinor() );

		if ( mw.config.get( 'wgUserLanguage' ) === 'en' ) {
			assert.strictEqual( rev.getFormattedDate(), '26 April 2016 10:27 AM' );
		}
	} );

	QUnit.test( 'isMinor with minor empty string', ( assert ) => {
		const rev = new Revision( {
			minor: ''
		} );

		assert.true( rev.isMinor() );
	} );

	QUnit.test( 'isMinor with minor true', ( assert ) => {
		const rev = new Revision( {
			minor: true
		} );

		assert.true( rev.isMinor() );
	} );

	QUnit.test( 'get and set relative size', ( assert ) => {
		const size = 5,
			rev = new Revision( {} );
		rev.setRelativeSize( size );
		assert.strictEqual( rev.getRelativeSize(), size );
	} );

	QUnit.revisionSlider.testOrSkip( 'getFormattedDate, offset: 0', ( assert ) => {
		const rev = new Revision( {
			timestamp: '2016-04-26T10:27:14Z' // 10:27, 26 Apr 2016
		} );

		assert.strictEqual( rev.getFormattedDate(), '26 April 2016 10:27 AM' );
	}, mw.config.get( 'wgUserLanguage' ) !== 'en' );
} );
