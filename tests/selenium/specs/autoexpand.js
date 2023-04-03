'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider expand', function () {

	before( async function () {
		await DiffPage.prepareSimpleTests( 2 );
	} );

	beforeEach( async function () {
		DiffPage.ready();
	} );

	afterEach( async function () {
		await DiffPage.resetAutoExpand();
		await browser.refresh();
	} );

	it( ' does not automatically expand by default', async function () {
		assert(
			await DiffPage.rsToggleButton.isDisplayed(),
			'there should be a RevisionSlider expand button'
		);
		assert(
			!await DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be hidden'
		);
	} );

	it( ' expands automatically when auto expand is on', async function () {
		await DiffPage.openSlider();
		await DiffPage.rsAutoExpandButton.click();

		await browser.refresh();
		DiffPage.ready();

		await DiffPage.rsMain.waitForDisplayed( { timeout: 10000 } );

		const classAttr = await DiffPage.rsAutoExpandButton.getAttribute( 'class' );
		assert(
			classAttr.includes( 'oo-ui-toggleWidget-on' ),
			'the auto expand button should be on'
		);
		assert(
			await DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be visible'
		);
	} );

	it( ' does not expand automatically when auto expand is off', async function () {
		await DiffPage.openSlider();
		await DiffPage.rsAutoExpandButton.click();
		await DiffPage.rsAutoExpandButton.click();

		await browser.refresh();
		DiffPage.ready();

		// this includes clicking the toggle button
		// an auto-expanded slider would be closed then
		await DiffPage.openSlider();
		const classAttr = await DiffPage.rsAutoExpandButton.getAttribute( 'class' );
		assert(
			await DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be visible'
		);
		assert(
			!( await classAttr.includes( 'oo-ui-toggleWidget-on' ) ),
			'the auto expand button should be off'
		);
	} );

	it( ' hides when collapsed manually', async function () {
		await DiffPage.openSlider();
		await DiffPage.rsToggleButton.click();

		assert(
			!await DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be hidden'
		);
	} );
} );
