var SliderModule = require( 'ext.RevisionSlider.Slider' ),
	Revision = SliderModule.Revision,
	RevisionList = SliderModule.RevisionList,
	RevisionListView = SliderModule.RevisionListView;

QUnit.module( 'ext.RevisionSlider.RevisionListView' );

QUnit.test( 'render adds revisions', function ( assert ) {
	var revisionListView = new RevisionListView( new RevisionList( [
		new Revision( { revid: 1, size: 5, comment: '' } ),
		new Revision( { revid: 3, size: 213, comment: '' } ),
		new Revision( { revid: 37, size: 100, comment: '' } )
	] ) );

	var $resultHtml = revisionListView.render( 11 );
	var $revisionWrapperDivs = $resultHtml.find( '.mw-revslider-revision-wrapper' );
	var $revisionDivs = $resultHtml.find( '.mw-revslider-revision' );

	assert.strictEqual( $revisionWrapperDivs.length, 3 );
	assert.strictEqual( $( $revisionDivs[ 0 ] ).attr( 'data-revid' ), '1' );
	assert.strictEqual( $( $revisionDivs[ 2 ] ).attr( 'data-revid' ), '37' );
	assert.strictEqual( $( $revisionDivs[ 1 ] ).css( 'width' ), '11px' );
	assert.strictEqual( $( $revisionDivs[ 1 ] ).css( 'height' ), '66px' ); // max relative size
	assert.ok( $( $revisionDivs[ 1 ] ).hasClass( 'mw-revslider-revision-up' ) );
	assert.ok( $( $revisionDivs[ 2 ] ).hasClass( 'mw-revslider-revision-down' ) );
} );

QUnit.test( 'tooltip is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView(),
		revision = new Revision( {
			revid: 1,
			size: 230,
			comment: 'Hello',
			parsedcomment: '<strong>Hello</strong>',
			timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
			user: 'User1',
			minor: true
		} );

	revision.setRelativeSize( 210 );

	SliderModule.setUserOffset( 0 );

	var tooltip = revisionListView.makeTooltip( revision, {} );
	var tooltipHtml = tooltip.$element.html();

	assert.ok( tooltipHtml.match( /User1/ ), 'Test the user.' );
	assert.ok( tooltipHtml.match( /Hello/ ), 'Test the comment.' );
	assert.ok( tooltipHtml.match( /230/ ), 'Test the page size.' );
	assert.ok( tooltipHtml.match( /\+210/ ), 'Test the change size.' );
} );

QUnit.revisionSlider.testOrSkip( 'tooltip is composed correctly with en lang', function ( assert ) {
	var revisionListView = new RevisionListView(),
		revision = new Revision( {
			revid: 1,
			size: 2300,
			comment: 'Hello',
			parsedcomment: '<strong>Hello</strong>',
			timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
			user: 'User1',
			minor: true
		} );

	revision.setRelativeSize( 2100 );

	SliderModule.setUserOffset( 0 );

	var tooltip = revisionListView.makeTooltip( revision, {} );
	var tooltipHtml = tooltip.$element.html();

	assert.ok( tooltipHtml.match( /User1/ ), 'Test the user.' );
	assert.ok( tooltipHtml.match( /Hello/ ), 'Test the comment.' );
	assert.ok( tooltipHtml.match( /2,300/ ), 'Test the page size.' );
	assert.ok( tooltipHtml.match( /\+2,100/ ), 'Test the change size.' );
	assert.ok( tooltipHtml.match( /26 April 2016 10:27 AM/ ), 'Test the date.' );
	assert.ok( tooltipHtml.match( /minor/ ), 'Test minor.' );
}, mw.config.get( 'wgUserLanguage' ) !== 'en' );

QUnit.test( 'empty user leads to no user line', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $userLineHtml = revisionListView.makeUserLine( null );

	assert.strictEqual( $userLineHtml, '' );
} );

QUnit.test( 'user line is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $userLineHtml = revisionListView.makeUserLine( 'User1' );

	assert.strictEqual( $userLineHtml.find( 'a' ).text(), 'User1' );
	assert.ok( $userLineHtml.find( 'a' ).attr( 'href' ).match( /User:User1/ ) );
} );

QUnit.test( 'IP user line is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $userLineHtml = revisionListView.makeUserLine( '127.0.0.1' );

	assert.strictEqual( $userLineHtml.find( 'a' ).text(), '127.0.0.1' );
	assert.ok( $userLineHtml.find( 'a' ).attr( 'href' ).match( /Special:Contributions\/127.0.0.1/ ) );
} );

QUnit.test( 'empty comment leads to no comment line', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $commentHtml = revisionListView.makeCommentLine( new Revision( {
		comment: '   ',
		parsedcomment: '   '
	} ) );

	assert.strictEqual( $commentHtml, '' );
} );

QUnit.test( 'comment line is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $commentLineHtml = revisionListView.makeCommentLine( new Revision( {
		comment: 'Hello',
		parsedcomment: '<strong>Hello</strong>'
	} ) );

	assert.strictEqual( $commentLineHtml.find( 'strong' ).length, 2 );
} );

QUnit.test( 'positive change is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 9 );

	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).length, 1 );
	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).text(), '+9' );
} );

QUnit.test( 'negative change is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $changeSizeLineHtml = revisionListView.makeChangeSizeLine( -9 );

	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-negative' ).length, 1 );
	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-negative' ).text(), '-9' );
} );

QUnit.test( 'neutral change is composed correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 0 );

	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-none' ).length, 1 );
	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-none' ).text(), '0' );
} );

QUnit.test( 'big change number is formatted correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $changeSizeLineHtml = revisionListView.makeChangeSizeLine( 1000 );

	assert.strictEqual( $changeSizeLineHtml.find( '.mw-revslider-change-positive' ).text(), '+1,000' );
} );

QUnit.test( 'page size is formatted correctly', function ( assert ) {
	var revisionListView = new RevisionListView();

	var $pageSizeLineHtml = revisionListView.makePageSizeLine( 1337 );

	assert.ok( $pageSizeLineHtml.text().match( /1,337/ ) );
} );
