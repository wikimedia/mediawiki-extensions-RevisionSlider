'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider revision tooltips', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 2 );
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	it( 'appears and remains on hovering it', async () => {

		await DiffPage.dwellRevision( 1 );

		assert(
			await DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should appear'
		);
		assert(
			!await DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should not appear'
		);

		await DiffPage.dwellRevision( 2 );

		assert(
			await DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should appear'
		);
		assert(
			!await DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should vanish'
		);

		await DiffPage.getTooltip( 2 ).moveTo();

		assert(
			await DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should still be visible'
		);

	} );

} );
