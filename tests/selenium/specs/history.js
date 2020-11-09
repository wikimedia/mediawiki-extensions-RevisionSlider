'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider history', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 4 );
	} );

	beforeEach( function () {
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	afterEach( function () {
		browser.refresh();
	} );

	it( ' can be accessed using browser back and forward buttons after clicking', function () {
		// On a page with 4 revisions, the default positions are 3 → 4.
		DiffPage.getRevisionDown( 1 ).click();
		// Positions are 1 → 4 now.
		DiffPage.waitUntilFinishedLoading();
		DiffPage.getRevisionUp( 2 ).click();
		// Positions are 1 → 2 now.
		DiffPage.waitUntilFinishedLoading();

		browser.back();
		DiffPage.waitUntilFinishedLoading();
		browser.back();
		DiffPage.waitUntilFinishedLoading();
		browser.forward();
		DiffPage.waitUntilFinishedLoading();

		// 2 steps back and 1 forward is the same as 1 back, i.e. positions should be 1 → 4 now.
		assert( DiffPage.isOlderPointerOn( 1 ) );
		assert( DiffPage.isNewerPointerOn( 4 ) );
		assert( DiffPage.showsOlderSummary( 1 ) );
		assert( DiffPage.showsNewerSummary( 4 ) );
	} );

	it( ' can be accessed using browser back and forward buttons after dragging', function () {
		DiffPage.rsPointerOlder.dragAndDrop( DiffPage.getRevision( 1 ) );
		DiffPage.waitUntilFinishedLoading();
		DiffPage.rsPointerNewer.dragAndDrop( DiffPage.getRevision( 2 ) );
		DiffPage.waitUntilFinishedLoading();

		browser.back();
		DiffPage.waitUntilFinishedLoading();
		browser.back();
		DiffPage.waitUntilFinishedLoading();
		browser.forward();
		DiffPage.waitUntilFinishedLoading();

		assert( DiffPage.isOlderPointerOn( 1 ) );
		assert( DiffPage.isNewerPointerOn( 4 ) );
		assert( DiffPage.showsOlderSummary( 1 ) );
		assert( DiffPage.showsNewerSummary( 4 ) );
	} );

} );
