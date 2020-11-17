'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider help', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 2, true );
	} );

	beforeEach( function () {
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	afterEach( function () {
		browser.refresh();
		DiffPage.toggleHelpDialog( true );
	} );

	it( 'tutorial is present on first load', function () {

		assert(
			DiffPage.helpDialog.isDisplayed(), 'help dialog should be visible'
		);

	} );

	it( 'tutorial is not present after it was dismissed once', function () {

		DiffPage.toggleHelpDialog( false );

		browser.refresh();
		DiffPage.openSlider();

		assert(
			!DiffPage.helpDialog.isDisplayed(), 'help dialog should not be present'
		);

	} );

	it( 'tutorial sequence works', function () {

		DiffPage.nextHelpButton.click();
		DiffPage.nextHelpButton.click();
		DiffPage.nextHelpButton.click();

		browser.refresh();
		DiffPage.openSlider();

		assert(
			!DiffPage.helpDialog.isDisplayed(), 'help dialog should not be present'
		);

	} );

} );
