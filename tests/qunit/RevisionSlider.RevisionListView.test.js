( function () {
	const SliderModule = require( 'ext.RevisionSlider.Slider' ),
		Revision = SliderModule.Revision,
		RevisionList = SliderModule.RevisionList,
		RevisionListView = SliderModule.RevisionListView;

	QUnit.module( 'ext.RevisionSlider.RevisionListView' );

	QUnit.test( 'render adds revisions', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList( [
			new Revision( { revid: 1, size: 5, comment: '' } ),
			new Revision( { revid: 3, size: 213, comment: '' } ),
			new Revision( { revid: 37, size: 100, comment: '' } )
		] ) );

		const $resultHtml = revisionListView.render( 11 );
		const $revisionWrapperDivs = $resultHtml.find( '.mw-revslider-revision-wrapper' );
		const $revisionDivs = $resultHtml.find( '.mw-revslider-revision' );

		assert.strictEqual( $revisionWrapperDivs.length, 3 );
		assert.strictEqual( $( $revisionDivs[ 0 ] ).attr( 'data-revid' ), '1' );
		assert.strictEqual( $( $revisionDivs[ 2 ] ).attr( 'data-revid' ), '37' );
		assert.strictEqual( $( $revisionDivs[ 1 ] ).css( 'width' ), '11px' );
		assert.strictEqual( $( $revisionDivs[ 1 ] ).css( 'height' ), '66px' ); // max relative size
		assert.true( $( $revisionDivs[ 1 ] ).hasClass( 'mw-revslider-revision-up' ) );
		assert.true( $( $revisionDivs[ 2 ] ).hasClass( 'mw-revslider-revision-down' ) );
	} );

	QUnit.test( 'tooltip is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() ),
			revision = new Revision( {
				revid: 1,
				size: 230,
				parsedcomment: '<strong>Hello</strong>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'User1',
				minor: true
			} );

		revision.setRelativeSize( 210 );

		SliderModule.setUserOffset( 0 );

		const tooltip = revisionListView.makeTooltip( revision, {} );
		const tooltipHtml = tooltip.$element.html();

		assert.true( /User1/.test( tooltipHtml ), 'Test the user.' );
		assert.true( /Hello/.test( tooltipHtml ), 'Test the comment.' );
		assert.true( /230/.test( tooltipHtml ), 'Test the page size.' );
		assert.true( /\+210/.test( tooltipHtml ), 'Test the change size.' );
	} );

	QUnit.revisionSlider.testOrSkip( 'tooltip is composed correctly with en lang', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() ),
			revision = new Revision( {
				revid: 1,
				size: 2300,
				parsedcomment: '<strong>Hello</strong>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'User1',
				minor: true
			} );

		revision.setRelativeSize( 2100 );

		SliderModule.setUserOffset( 0 );

		const tooltip = revisionListView.makeTooltip( revision, {} );
		const tooltipHtml = tooltip.$element.html();

		assert.true( /User1/.test( tooltipHtml ), 'Test the user.' );
		assert.true( /Hello/.test( tooltipHtml ), 'Test the comment.' );
		assert.true( /2,300/.test( tooltipHtml ), 'Test the page size.' );
		assert.true( /\+2,100/.test( tooltipHtml ), 'Test the change size.' );
		assert.true( /26 April 2016 10:27 AM/.test( tooltipHtml ), 'Test the date.' );
		assert.true( /minor/.test( tooltipHtml ), 'Test minor.' );
	}, mw.config.get( 'wgUserLanguage' ) !== 'en' );

	QUnit.test( 'empty user leads to no user line', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $userLineHtml = revisionListView.makeUserLine( null );

		assert.strictEqual( $userLineHtml, '' );
	} );

	QUnit.test( 'user line is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $userLineHtml = revisionListView.makeUserLine( 'User1' );

		assert.strictEqual( $userLineHtml.find( 'a' ).text(), 'User1' );
		assert.true( /User:User1/.test( $userLineHtml.find( 'a' ).attr( 'href' ) ) );
	} );

	QUnit.test( 'IP user line is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $userLineHtml = revisionListView.makeUserLine( '127.0.0.1' );

		assert.strictEqual( $userLineHtml.find( 'a' ).text(), '127.0.0.1' );
		assert.true( /Special:Contributions\/127.0.0.1/.test( $userLineHtml.find( 'a' ).attr( 'href' ) ) );
	} );

	QUnit.test( 'empty comment leads to no comment line', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $commentHtml = revisionListView.makeCommentLine( new Revision( {
			parsedcomment: '   '
		} ) );

		assert.strictEqual( $commentHtml, '' );
	} );

	QUnit.test( 'comment line is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $commentLineHtml = revisionListView.makeCommentLine( new Revision( {
			parsedcomment: '<strong>Hello</strong>'
		} ) );

		assert.strictEqual( $commentLineHtml.find( 'strong' ).length, 2 );
	} );

	QUnit.test( 'positive change is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 9 );

		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).length, 1 );
		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).text(), '+9' );
	} );

	QUnit.test( 'negative change is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $changeSizeLineHtml = revisionListView.makeChangeSizeLine( -9 );

		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-negative' ).length, 1 );
		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-negative' ).text(), '-9' );
	} );

	QUnit.test( 'neutral change is composed correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 0 );

		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-none' ).length, 1 );
		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-none' ).text(), '0' );
	} );

	QUnit.test( 'big change number is formatted correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 1000 );

		assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).text(), '+1,000' );
	} );

	QUnit.test( 'page size is formatted correctly', ( assert ) => {
		const revisionListView = new RevisionListView( new RevisionList() );

		const $pageSizeLineHtml = revisionListView.makePageSizeLine( 1337 );

		assert.true( /1,337/.test( $pageSizeLineHtml.text() ) );
	} );
}() );
