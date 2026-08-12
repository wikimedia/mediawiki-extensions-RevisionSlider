import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider help', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 2, true );
	} );

	beforeEach( async () => {
		await DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
		await DiffPage.toggleHelpDialog( true );
	} );

	it( 'tutorial is present on first load', async () => {

		await expect( DiffPage.helpDialog ).toBeDisplayed();

	} );

	it( 'tutorial is not present after it was dismissed once', async () => {

		await DiffPage.toggleHelpDialog( false );

		await browser.refresh();
		await DiffPage.openSlider();

		await expect( DiffPage.helpDialog ).not.toBeDisplayed();

	} );

	it( 'tutorial sequence works', async () => {

		await DiffPage.nextHelpButton.click();
		await DiffPage.nextHelpButton.click();
		await DiffPage.nextHelpButton.click();

		await browser.refresh();
		await DiffPage.openSlider();

		await expect( DiffPage.helpDialog ).not.toBeDisplayed();

	} );

} );
