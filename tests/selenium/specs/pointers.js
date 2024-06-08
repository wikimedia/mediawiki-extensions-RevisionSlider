'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider pointers', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 3 );
	} );

	beforeEach( async () => {
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
	} );

	it( ' can be dragged', async () => {
		assert(
			await DiffPage.isOlderPointerOn( 2 ),
			'older pointer should be on previous revision'
		);
		assert(
			await DiffPage.isNewerPointerOn( 3 ),
			'newer pointer should be on current revision'
		);

		await DiffPage.dragOlderPointerTo( 1 );
		await DiffPage.waitUntilLoaded();

		await DiffPage.dragNewerPointerTo( 2 );
		await DiffPage.waitUntilLoaded();

		assert(
			await DiffPage.isOlderPointerOn( 1 ),
			'older pointer should be on revision 1'
		);
		assert(
			await DiffPage.isNewerPointerOn( 2 ),
			'newer pointer should be on revision 2'
		);
		assert(
			await DiffPage.showsOlderSummary( 1 ),
			'revision 1 should be loaded on the left of the diff'
		);
		assert(
			await DiffPage.showsNewerSummary( 2 ),
			'revision 2 should be loaded on the right of the diff'
		);
	} );
} );
