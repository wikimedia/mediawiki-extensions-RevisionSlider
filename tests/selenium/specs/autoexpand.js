'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider expand', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 2 );
	} );

	beforeEach( function () {
		DiffPage.ready();
	} );

	afterEach( function () {
		DiffPage.resetAutoExpand();
		browser.refresh();
	} );

	it( ' does not automatically expand by default', function () {
		assert(
			DiffPage.rsToggleButton.isDisplayed(),
			'there should be a RevisionSlider expand button'
		);
		assert(
			!DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be hidden'
		);
	} );

	it( ' expands automatically when auto expand is on', function () {
		DiffPage.openSlider();
		DiffPage.rsAutoExpandButton.click();

		browser.refresh();
		DiffPage.ready();

		DiffPage.rsMain.waitForDisplayed( { timeout: 10000 } );

		assert(
			DiffPage.rsAutoExpandButton.getAttribute( 'class' )
				.indexOf( 'oo-ui-toggleWidget-on' ) !== -1,
			'the auto expand button should be on'
		);
		assert(
			DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be visible'
		);
	} );

	it( ' does not expand automatically when auto expand is off', function () {
		DiffPage.openSlider();
		DiffPage.rsAutoExpandButton.click();
		DiffPage.rsAutoExpandButton.click();

		browser.refresh();
		DiffPage.ready();

		// this includes clicking the toggle button
		// an auto-expanded slider would be closed then
		DiffPage.openSlider();
		assert(
			DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be visible'
		);
		assert(
			DiffPage.rsAutoExpandButton.getAttribute( 'class' )
				.indexOf( 'oo-ui-toggleWidget-on' ) === -1,
			'the auto expand button should be off'
		);
	} );

	it( ' hides when collapsed manually', function () {
		DiffPage.openSlider();
		DiffPage.rsToggleButton.click();

		assert(
			!DiffPage.rsMain.isDisplayed(),
			'the RevisionSlider wrapper should be hidden'
		);
	} );
} );
