'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider revision tooltips', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 2 );
	} );

	beforeEach( function () {
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	afterEach( function () {
		browser.refresh();
	} );

	it( 'should appear on hover', function () {

		DiffPage.dwellRevision( 1 );

		DiffPage.dwellRevision( 2 );

		assert(
			DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should appear'
		);

		assert(
			!DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should not appear'
		);

	} );

	it( 'appears and remains on hover', function () {

		DiffPage.dwellRevision( 1 );
		DiffPage.getTooltip( 1 ).moveTo();

		DiffPage.dwellRevision( 2 );
		DiffPage.getTooltip( 2 ).moveTo();

		assert(
			DiffPage.getTooltip( 2 ).isDisplayed(), 'tooltip 2 should appear'
		);

		assert(
			!DiffPage.getTooltip( 1 ).isDisplayed(), 'tooltip 1 should not appear'
		);

	} );

} );
