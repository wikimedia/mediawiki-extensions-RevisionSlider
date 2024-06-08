'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider timeline arrows', () => {

	afterEach( async () => {
		await browser.refresh();
	} );

	it( ' should be disabled with 3 revisions', async () => {
		await DiffPage.prepareSimpleTests( 3 );
		DiffPage.ready();
		await DiffPage.openSlider();

		assert(
			await DiffPage.isBackwardsArrowDisabled(),
			'backwards arrow should be disabled'
		);
		assert(
			await DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be disabled'
		);
	} );

	it( ' should be enabled with adequate revisions', async () => {
		await browser.setWindowSize( 400, 600 );
		await DiffPage.prepareSimpleTests( 20 );
		DiffPage.ready();
		await DiffPage.openSlider();

		await DiffPage.backwardsArrow.click();
		await DiffPage.waitForSliding();

		assert(
			!await DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be enabled'
		);

		await DiffPage.forwardsArrow.click();
		DiffPage.waitForSliding();

		assert(
			!await DiffPage.isBackwardsArrowDisabled(),
			'backwards arrow should be enabled'
		);
		assert(
			await DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be disabled'
		);
	} );
} );
