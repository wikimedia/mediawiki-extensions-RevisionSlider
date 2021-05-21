'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider timeline arrows', function () {

	afterEach( function () {
		browser.refresh();
	} );

	it( ' should be disabled with 3 revisions', function () {
		DiffPage.prepareSimpleTests( 3 );
		DiffPage.ready();
		DiffPage.openSlider();

		assert(
			DiffPage.isBackwardsArrowDisabled(),
			'backwards arrow should be disabled'
		);
		assert(
			DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be disabled'
		);
	} );

	it( ' should be enabled with adequate revisions', function () {
		browser.setWindowSize( 400, 600 );
		DiffPage.prepareSimpleTests( 9 );
		DiffPage.ready();
		DiffPage.openSlider();

		DiffPage.backwardsArrow.click();
		DiffPage.waitForSliding();

		assert(
			!DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be enabled'
		);

		DiffPage.forwardsArrow.click();
		DiffPage.waitForSliding();

		assert(
			!DiffPage.isBackwardsArrowDisabled(),
			'backwards arrow should be enabled'
		);
		assert(
			DiffPage.isForwardsArrowDisabled(),
			'forwards arrow should be disabled'
		);
	} );
} );
