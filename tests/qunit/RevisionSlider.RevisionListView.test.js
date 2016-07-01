( function ( mw ) {
	var RevisionListView = mw.libs.revisionSlider.RevisionListView,
		RevisionList = mw.libs.revisionSlider.RevisionList,
		Revision = mw.libs.revisionSlider.Revision;

	QUnit.module( 'ext.RevisionSlider.RevisionListView' );

	QUnit.test( 'render adds revisions', function ( assert ) {
		var revisionListView = new RevisionListView( new RevisionList( [
				{ revid: 1, size: 5, comment: '' },
				{ revid: 3, size: 213, comment: '' },
				{ revid: 37, size: 100, comment: '' }
			] ) ),
			$resultHtml, $revisionWrapperDivs, $revisionDivs;

		$resultHtml = revisionListView.render( 11 );
		$revisionWrapperDivs = $resultHtml.find( '.mw-revision-wrapper' );
		$revisionDivs = $resultHtml.find( '.mw-revision' );

		assert.equal( $revisionWrapperDivs.length, 3 );
		assert.equal( $( $revisionDivs[ 0 ] ).attr( 'data-revid' ), 1 );
		assert.equal( $( $revisionDivs[ 2 ] ).attr( 'data-revid' ), 37 );
		assert.equal( $( $revisionDivs[ 1 ] ).css( 'width' ), '11px' );
		assert.equal( $( $revisionDivs[ 1 ] ).css( 'height' ), '70px' ); // max relative size
		assert.ok( $( $revisionDivs[ 1 ] ).hasClass( 'mw-revision-up' ) );
		assert.ok( $( $revisionDivs[ 2 ] ).hasClass( 'mw-revision-down' ) );
	} );

	QUnit.test( 'tool tip is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			revision = new Revision( {
				revid: 1,
				size: 1230,
				comment: 'Hello',
				parsedcomment: '<strong>Hello</strong>',
				timestamp: '2016-04-26T10:27:14Z', // 10:27, 26 Apr 2016
				user: 'User1',
				minor: true
			} ),
			$tooltipHtml;

		revision.setRelativeSize( 3210 );

		mw.libs.revisionSlider.userOffset = 0;

		$tooltipHtml = revisionListView.makeTooltip( revision );

		assert.ok( $tooltipHtml.match( /10:27, 26 Apr 2016/ ), 'Test the date.' );
		assert.ok( $tooltipHtml.match( /User1/ ), 'Test the user.' );
		assert.ok( $tooltipHtml.match( /Hello/ ), 'Test the comment.' );
		assert.ok( $tooltipHtml.match( /1,230/ ), 'Test the page size.' );
		assert.ok( $tooltipHtml.match( /\+3,210/ ), 'Test the change size.' );
		assert.ok( $tooltipHtml.match( /This is a minor edit/ ), 'Test for minor edit.' );
	} );

	QUnit.test( 'empty user leads to no user line', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$userLineHtml;

		$userLineHtml = revisionListView.makeUserLine( null );

		assert.equal( $userLineHtml, '' );
	} );

	QUnit.test( 'user line is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$userLineHtml;

		$userLineHtml = revisionListView.makeUserLine( 'User1' );

		assert.equal( $userLineHtml.find( 'a' ).text(), 'User1' );
		assert.ok( $userLineHtml.find( 'a' ).attr( 'href' ).match( /User:User1/ ) );
	} );

	QUnit.test( 'IP user line is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$userLineHtml;

		$userLineHtml = revisionListView.makeUserLine( '127.0.0.1' );

		assert.equal( $userLineHtml.find( 'a' ).text(), '127.0.0.1' );
		assert.ok( $userLineHtml.find( 'a' ).attr( 'href' ).match( /Special:Contributions\/127.0.0.1/ ) );
	} );

	QUnit.test( 'empty comment leads to no comment line', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$commentHtml;

		$commentHtml = revisionListView.makeCommentLine( new Revision( {
			comment: '   ',
			parsedcomment: '   '
		} ) );

		assert.equal( $commentHtml, '' );
	} );

	QUnit.test( 'comment line is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$commentLineHtml;

		$commentLineHtml = revisionListView.makeCommentLine( new Revision( {
			comment: 'Hello',
			parsedcomment: '<strong>Hello</strong>'
		} ) );

		assert.equal( $commentLineHtml.find( 'strong' ).length, 2 );
	} );

	QUnit.test( 'positive change is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$changeSizeLineHtml;

		$changeSizeLineHtml = revisionListView.makeChangeSizeLine( 9 );

		assert.equal( $changeSizeLineHtml.find( '.mw-positive-change' ).length, 1 );
		assert.equal( $changeSizeLineHtml.find( '.mw-positive-change' ).text(), '+9' );
	} );

	QUnit.test( 'negative change is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$changeSizeLineHtml;

		$changeSizeLineHtml = revisionListView.makeChangeSizeLine( -9 );

		assert.equal( $changeSizeLineHtml.find( '.mw-negative-change' ).length, 1 );
		assert.equal( $changeSizeLineHtml.find( '.mw-negative-change' ).text(), '-9' );
	} );

	QUnit.test( 'neutral change is composed correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$changeSizeLineHtml;

		$changeSizeLineHtml = revisionListView.makeChangeSizeLine( 0 );

		assert.equal( $changeSizeLineHtml.find( '.mw-no-change' ).length, 1 );
		assert.equal( $changeSizeLineHtml.find( '.mw-no-change' ).text(), '0' );
	} );

	QUnit.test( 'big change number is formatted correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$changeSizeLineHtml;

		$changeSizeLineHtml = revisionListView.makeChangeSizeLine( 1000 );

		assert.equal( $changeSizeLineHtml.find( '.mw-positive-change' ).text(), '+1,000' );
	} );

	QUnit.test( 'page size is formatted correctly', function ( assert ) {
		var revisionListView = new RevisionListView(),
			$pageSizeLineHtml;

		$pageSizeLineHtml = revisionListView.makePageSizeLine( 1337 );

		assert.ok( $pageSizeLineHtml.text().match( /1,337/ ) );
	} );

} )( mediaWiki );
