import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider revision tooltips', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 2 );
		await DiffPage.ready();
		await DiffPage.openSlider();
	} );

	it( 'appears and remains on hovering it', async () => {

		await DiffPage.dwellRevision( 1 );

		await expect( DiffPage.getTooltip( 1 ) ).toBeDisplayed();
		await expect( DiffPage.getTooltip( 2 ) ).not.toBeDisplayed();

		await DiffPage.dwellRevision( 2 );

		await expect( DiffPage.getTooltip( 2 ) ).toBeDisplayed();
		await expect( DiffPage.getTooltip( 1 ) ).not.toBeDisplayed();

		await DiffPage.getTooltip( 2 ).moveTo();

		await expect( DiffPage.getTooltip( 2 ) ).toBeDisplayed();

	} );

} );
