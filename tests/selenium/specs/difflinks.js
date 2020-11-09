'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider diff links', function () {

	beforeEach( function () {
		DiffPage.prepareSimpleTests( 3 );
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	it( ' older edit diff link can be clicked', function () {
		DiffPage.rsEditOlderButton.click();
		DiffPage.waitUntilLoaded();

		assert( DiffPage.isOlderPointerOn( 1 ) );
		assert( DiffPage.isNewerPointerOn( 2 ) );
		assert( DiffPage.showsOlderSummary( 1 ) );
		assert( DiffPage.showsNewerSummary( 2 ) );
	} );

	it( ' newer edit diff link can be clicked', function () {
		DiffPage.rsEditOlderButton.click();
		DiffPage.waitUntilLoaded();

		DiffPage.rsEditNewerButton.click();
		DiffPage.waitUntilLoaded();

		assert( DiffPage.isOlderPointerOn( 2 ) );
		assert( DiffPage.isNewerPointerOn( 3 ) );
		assert( DiffPage.showsOlderSummary( 2 ) );
		assert( DiffPage.showsNewerSummary( 3 ) );
	} );
} );
