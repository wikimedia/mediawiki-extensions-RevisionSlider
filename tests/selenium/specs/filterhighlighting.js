import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider filter highlighting', () => {

	before( async () => {
		await DiffPage.prepareFilterTests();
	} );

	beforeEach( async () => {
		await DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
	} );

	it( 'highlights revisions by the same user when I use the user filter', async () => {
		await DiffPage.dwellRevision( 1 );
		await DiffPage.clickUserFilterBubble();
		expect( await DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) ).toBe( true );
		// Revisions 1, 2 and 4 are from the selected user
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( true );
		// Revision 3 is from a different user
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
	} );

	it( 'stops highlighting revisions when the filter is clicked twice', async () => {
		await DiffPage.dwellRevision( 1 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.clickUserFilterBubble();

		expect( await DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( false );
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickTagFilterBubble();

		expect( await DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ) ).toBe( true );
		// Only revision 4 has the selected tag
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
	} );

	it( 'highlights revisions that have the same tag when I use the tag filter after I used the user filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.clickTagFilterBubble();

		expect( await DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) ).toBe( false );
		expect( await DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ) ).toBe( true );
		// Only revision 4 has the selected tag
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
	} );

	it( 'only highlights revisions that have the same tag when I selected a user but hover a tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.dwellTagFilterBubble();

		expect( await DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) ).toBe( true );
		expect( await DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ) ).toBe( true );
		// Only revision 4 has the selected tag
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( false );
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
	} );

	it( 're-applies highlight when I selected a user but hover and on-hover a tag filter', async () => {
		await DiffPage.dwellRevision( 4 );
		await DiffPage.clickUserFilterBubble();
		await DiffPage.dwellTagFilterBubble();
		await DiffPage.abondonBubbleDwell();

		expect( await DiffPage.highlightsBubble( DiffPage.rsUserFilterBubble ) ).toBe( true );
		expect( await DiffPage.highlightsBubble( DiffPage.rsTagFilterBubble ) ).toBe( false );
		// Revisions 1, 2 and 4 are from the selected user
		expect( await DiffPage.highlightsRevision( 1 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 2 ) ).toBe( true );
		expect( await DiffPage.highlightsRevision( 4 ) ).toBe( true );
		// Revision 3 is from a different user
		expect( await DiffPage.highlightsRevision( 3 ) ).toBe( false );
	} );
} );
