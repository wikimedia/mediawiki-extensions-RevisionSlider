'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider history', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 4 );
	} );

	beforeEach( async () => {
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
	} );

	it( ' can be accessed using browser back and forward buttons after clicking', async () => {
		// On a page with 4 revisions, the default positions are 3 → 4.
		await DiffPage.getRevisionDown( 1 ).click();
		// Positions are 1 → 4 now.
		await DiffPage.waitUntilLoaded();
		await DiffPage.getRevisionUp( 2 ).click();
		// Positions are 1 → 2 now.
		await DiffPage.waitUntilLoaded();

		await browser.back();
		await DiffPage.waitUntilLoaded();
		await browser.back();
		await DiffPage.waitUntilLoaded();
		await browser.forward();
		await DiffPage.waitUntilLoaded();

		// 2 steps back and 1 forward is the same as 1 back, i.e. positions should be 1 → 4 now.
		assert( await DiffPage.isOlderPointerOn( 1 ) );
		assert( await DiffPage.isNewerPointerOn( 4 ) );
		assert( await DiffPage.showsOlderSummary( 1 ) );
		assert( await DiffPage.showsNewerSummary( 4 ) );
	} );

	it( ' can be accessed using browser back and forward buttons after dragging', async () => {
		await DiffPage.dragOlderPointerTo( 1 );
		await DiffPage.waitUntilLoaded();
		await DiffPage.dragNewerPointerTo( 2 );
		await DiffPage.waitUntilLoaded();

		await browser.back();
		await DiffPage.waitUntilLoaded();
		await browser.back();
		await DiffPage.waitUntilLoaded();
		await browser.forward();
		await DiffPage.waitUntilLoaded();

		assert( await DiffPage.isOlderPointerOn( 1 ) );
		assert( await DiffPage.isNewerPointerOn( 4 ) );
		assert( await DiffPage.showsOlderSummary( 1 ) );
		assert( await DiffPage.showsNewerSummary( 4 ) );
	} );

} );
