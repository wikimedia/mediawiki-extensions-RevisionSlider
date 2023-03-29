'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider revision tooltips', function () {

	before( async function () {
		await DiffPage.prepareSimpleTests( 2 );
	} );

	beforeEach( async function () {
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async function () {
		await browser.refresh();
	} );

	it( 'should appear on hover', async function () {

		await DiffPage.dwellRevision( 1 );

		await DiffPage.dwellRevision( 2 );

		assert(
			await DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should appear'
		);

		assert(
			!await DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should not appear'
		);

	} );

	it( 'appears and remains on hover', async function () {

		await DiffPage.dwellRevision( 1 );
		await DiffPage.getTooltip( 1 ).moveTo();

		await DiffPage.dwellRevision( 2 );
		await DiffPage.getTooltip( 2 ).moveTo();

		assert(
			await DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should appear'
		);

		assert(
			!await DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should not appear'
		);

	} );

} );
