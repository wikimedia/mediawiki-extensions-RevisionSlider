'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider pointers', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 3 );
	} );

	beforeEach( function () {
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	afterEach( function () {
		browser.refresh();
	} );

	it( ' can be dragged', function () {
		assert(
			DiffPage.isOlderPointerOn( 2 ),
			'older pointer should be on previous revision'
		);
		assert(
			DiffPage.isNewerPointerOn( 3 ),
			'newer pointer should be on current revision'
		);

		DiffPage.dragOlderPointerTo( 1 );
		DiffPage.waitUntilLoaded();

		DiffPage.dragNewerPointerTo( 2 );
		DiffPage.waitUntilLoaded();

		assert(
			DiffPage.isOlderPointerOn( 1 ),
			'older pointer should be on revision 1'
		);
		assert(
			DiffPage.isNewerPointerOn( 2 ),
			'newer pointer should be on revision 2'
		);
		assert(
			DiffPage.showsOlderSummary( 1 ),
			'revision 1 should be loaded on the left of the diff'
		);
		assert(
			DiffPage.showsNewerSummary( 2 ),
			'revision 2 should be loaded on the right of the diff'
		);
	} );
} );
