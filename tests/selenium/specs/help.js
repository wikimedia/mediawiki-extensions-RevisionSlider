'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider help', function () {

	before( async function () {
		await DiffPage.prepareSimpleTests( 2, true );
	} );

	beforeEach( async function () {
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async function () {
		await browser.refresh();
		await DiffPage.toggleHelpDialog( true );
	} );

	it( 'tutorial is present on first load', async function () {

		assert(
			await DiffPage.helpDialog.isDisplayed(), 'help dialog should be visible'
		);

	} );

	it( 'tutorial is not present after it was dismissed once', async function () {

		await DiffPage.toggleHelpDialog( false );

		await browser.refresh();
		await DiffPage.openSlider();

		assert(
			!await DiffPage.helpDialog.isDisplayed(), 'help dialog should not be present'
		);

	} );

	it( 'tutorial sequence works', async function () {

		await DiffPage.nextHelpButton.click();
		await DiffPage.nextHelpButton.click();
		await DiffPage.nextHelpButton.click();

		await browser.refresh();
		await DiffPage.openSlider();

		assert(
			!await DiffPage.helpDialog.isDisplayed(), 'help dialog should not be present'
		);

	} );

} );
