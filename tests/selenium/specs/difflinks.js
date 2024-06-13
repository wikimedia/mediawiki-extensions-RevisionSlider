'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider diff links', () => {

	beforeEach( async () => {
		await DiffPage.prepareSimpleTests( 3 );
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	it( ' older edit diff link can be clicked', async () => {
		await DiffPage.rsEditOlderButton.click();
		await DiffPage.waitUntilLoaded();

		assert( await DiffPage.isOlderPointerOn( 1 ) );
		assert( await DiffPage.isNewerPointerOn( 2 ) );
		assert( await DiffPage.showsOlderSummary( 1 ) );
		assert( await DiffPage.showsNewerSummary( 2 ) );
	} );

	it( ' newer edit diff link can be clicked', async () => {
		await DiffPage.rsEditOlderButton.click();
		await DiffPage.waitUntilLoaded();

		await DiffPage.rsEditNewerButton.click();
		await DiffPage.waitUntilLoaded();

		assert( await DiffPage.isOlderPointerOn( 2 ) );
		assert( await DiffPage.isNewerPointerOn( 3 ) );
		assert( await DiffPage.showsOlderSummary( 2 ) );
		assert( await DiffPage.showsNewerSummary( 3 ) );
	} );
} );
