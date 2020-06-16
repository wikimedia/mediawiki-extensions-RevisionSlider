'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider filter highlighting', function () {

	before( function () {
		DiffPage.prepareFilterTests();
	} );

	beforeEach( function () {
		DiffPage.ready();
		DiffPage.openSlider();
	} );

	afterEach( function () {
		browser.refresh();
	} );

	it( 'highlights revisions by the same user when I use the user filter', function () {
		DiffPage.dwellRevision( 1 );
		DiffPage.clickUserFilterBubble();

		assert( DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) );
		assert(
			DiffPage.highlightsRevision( 1 ) &&
			DiffPage.highlightsRevision( 2 ) &&
			DiffPage.highlightsRevision( 4 ),
			'does highlight revisions from the selected user'
		);
		assert(
			!DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions from a different user'
		);
	} );

	it( 'stops highlighting revisions when the filter is clicked twice', function () {
		DiffPage.dwellRevision( 1 );
		DiffPage.clickUserFilterBubble();
		DiffPage.clickUserFilterBubble();

		assert(
			!DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ),
			'the user filter bubble should not be highlighted'
		);
		assert(
			!DiffPage.highlightsRevision( 1 ) &&
			!DiffPage.highlightsRevision( 2 ) &&
			!DiffPage.highlightsRevision( 3 ) &&
			!DiffPage.highlightsRevision( 4 ),
			'does not highlight any revisions'
		);
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter', function () {
		DiffPage.dwellRevision( 4 );
		DiffPage.clickTagFilterBubble();

		assert( DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ) );
		assert(
			DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!DiffPage.highlightsRevision( 1 ) &&
			!DiffPage.highlightsRevision( 2 ) &&
			!DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter after I used the user filter', function () {
		DiffPage.dwellRevision( 4 );
		DiffPage.clickUserFilterBubble();
		DiffPage.clickTagFilterBubble();

		assert(
			!DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ),
			'the user filter bubble should not be highlighted'
		);
		assert(
			DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should be highlighted'
		);
		assert(
			DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!DiffPage.highlightsRevision( 1 ) &&
			!DiffPage.highlightsRevision( 2 ) &&
			!DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 'only highlights revisions that have the same tag when I selected a user but hover a tag filter', function () {
		DiffPage.dwellRevision( 4 );
		DiffPage.clickUserFilterBubble();
		DiffPage.dwellTagFilterBubble();

		assert(
			DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ),
			'the user filter bubble should still be highlighted'
		);
		assert(
			DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should be highlighted'
		);
		assert(
			DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!DiffPage.highlightsRevision( 1 ) &&
			!DiffPage.highlightsRevision( 2 ) &&
			!DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 're-applies highlight when I selected a user but hover and on-hover a tag filter', function () {
		DiffPage.dwellRevision( 4 );
		DiffPage.clickUserFilterBubble();
		DiffPage.dwellTagFilterBubble();
		DiffPage.abondonBubbleDwell();

		assert(
			DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ),
			'the user filter bubble should still be highlighted'
		);
		assert(
			!DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should not be highlighted'
		);
		assert(
			DiffPage.highlightsRevision( 1 ) &&
			DiffPage.highlightsRevision( 2 ) &&
			DiffPage.highlightsRevision( 4 ),
			'does highlight revisions from the selected user'
		);
		assert(
			!DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions from a different user'
		);
	} );
} );
