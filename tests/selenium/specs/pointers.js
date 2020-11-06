'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider pointers', function () {

	before( function () {
		DiffPage.prepareSimpleTests( 5 );
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
			DiffPage.isOlderPointerOn( 4 ),
			'older pointer should be on previous revision'
		);
		assert(
			DiffPage.isNewerPointerOn( 5 ),
			'newer pointer should be on current revision'
		);

		DiffPage.dragOlderPointerTo( 3 );
		DiffPage.waitUntilLoaded();

		DiffPage.dragNewerPointerTo( 4 );
		DiffPage.waitUntilLoaded();

		assert(
			DiffPage.isOlderPointerOn( 3 ),
			'older pointer should be on revision 3'
		);
		assert(
			DiffPage.isNewerPointerOn( 4 ),
			'newer pointer should be on revision 4'
		);
		assert(
			DiffPage.showsOlderSummary( 3 ),
			'revision 3 should be loaded on the left of the diff'
		);
		assert(
			DiffPage.showsNewerSummary( 4 ),
			'revision 4 should be loaded on the right of the diff'
		);
	} );
} );
