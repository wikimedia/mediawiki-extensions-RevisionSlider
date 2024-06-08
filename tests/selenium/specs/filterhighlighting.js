'use strict';

const assert = require( 'assert' ),
	DiffPage = require( '../pageobjects/diff.page' );

describe( 'RevisionSlider filter highlighting', () => {

	before( async () => {
		await DiffPage.prepareFilterTests();
	} );

	beforeEach( async () => {
		DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
	} );

	it( 'highlights revisions by the same user when I use the user filter', async () => {
		await DiffPage.dwellRevision( 1 );
		await DiffPage.clickUserFilterBubble();
		assert( await DiffPage.highlightsBubble( await DiffPage.rsUserFilterBubble ) );
		assert(
			await DiffPage.highlightsRevision( 1 ) &&
			await DiffPage.highlightsRevision( 2 ) &&
			await DiffPage.highlightsRevision( 4 ),
			'does highlight revisions from the selected user'
		);
		assert(
			!await DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions from a different user'
		);
	} );

	it( 'stops highlighting revisions when the filter is clicked twice', async () => {
		await DiffPage.dwellRevision( 1 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.clickUserFilterBubble();

		assert(
			!await DiffPage.highlightsBubble( await DiffPage.rsUserFilterBubble ),
			'the user filter bubble should not be highlighted'
		);
		assert(
			!await DiffPage.highlightsRevision( 1 ) &&
			!await DiffPage.highlightsRevision( 2 ) &&
			!await DiffPage.highlightsRevision( 3 ) &&
			!await DiffPage.highlightsRevision( 4 ),
			'does not highlight any revisions'
		);
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickTagFilterBubble();

		assert( await DiffPage.highlightsBubble( await DiffPage.rsTagFilterBubble ) );
		assert(
			await DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!await DiffPage.highlightsRevision( 1 ) &&
			!await DiffPage.highlightsRevision( 2 ) &&
			!await DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter after I used the user filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.clickTagFilterBubble();

		assert(
			!await DiffPage.highlightsBubble( await DiffPage.rsUserFilterBubble ),
			'the user filter bubble should not be highlighted'
		);
		assert(
			await DiffPage.highlightsBubble( await DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should be highlighted'
		);
		assert(
			await DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!await DiffPage.highlightsRevision( 1 ) &&
			!await DiffPage.highlightsRevision( 2 ) &&
			!await DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 'only highlights revisions that have the same tag when I selected a user but hover a tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.dwellTagFilterBubble();

		assert(
			await DiffPage.highlightsBubble( await DiffPage.rsUserFilterBubble ),
			'the user filter bubble should still be highlighted'
		);
		assert(
			await DiffPage.highlightsBubble( await DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should be highlighted'
		);
		assert(
			await DiffPage.highlightsRevision( 4 ),
			'does highlight revisions with the selected tag'
		);
		assert(
			!await DiffPage.highlightsRevision( 1 ) &&
			!await DiffPage.highlightsRevision( 2 ) &&
			!await DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions without the selected tag'
		);
	} );

	it( 're-applies highlight when I selected a user but hover and on-hover a tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.dwellTagFilterBubble();
		await DiffPage.abondonBubbleDwell();

		assert(
			await DiffPage.highlightsBubble( await DiffPage.rsUserFilterBubble ),
			'the user filter bubble should still be highlighted'
		);
		assert(
			!await DiffPage.highlightsBubble( await DiffPage.rsTagFilterBubble ),
			'the tag filter bubble should not be highlighted'
		);
		assert(
			await DiffPage.highlightsRevision( 1 ) &&
			await DiffPage.highlightsRevision( 2 ) &&
			await DiffPage.highlightsRevision( 4 ),
			'does highlight revisions from the selected user'
		);
		assert(
			!await DiffPage.highlightsRevision( 3 ),
			'does not highlight revisions from a different user'
		);
	} );
} );
