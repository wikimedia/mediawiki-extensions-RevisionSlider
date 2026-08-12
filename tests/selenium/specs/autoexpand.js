import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider expand', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 2 );
	} );

	beforeEach( async () => {
		await DiffPage.ready();
	} );

	afterEach( async () => {
		await DiffPage.resetAutoExpand();
		await browser.refresh();
	} );

	it( ' does not automatically expand by default', async () => {
		await expect( DiffPage.rsToggleButton ).toBeDisplayed();
		await expect( DiffPage.rsMain ).not.toBeDisplayed();
	} );

	it( ' expands automatically when auto expand is on', async () => {
		await DiffPage.openSlider();
		await DiffPage.rsAutoExpandButton.click();

		await browser.refresh();
		await DiffPage.ready();

		await DiffPage.rsMain.waitForDisplayed( { timeout: 10000 } );

		const classAttr = await DiffPage.rsAutoExpandButton.getAttribute( 'class' );
		expect( classAttr ).toContain( 'oo-ui-toggleWidget-on' );
		await expect( DiffPage.rsMain ).toBeDisplayed();
	} );

	it( ' does not expand automatically when auto expand is off', async () => {
		await DiffPage.openSlider();
		await DiffPage.rsAutoExpandButton.click();
		await DiffPage.rsAutoExpandButton.click();

		await browser.refresh();
		await DiffPage.ready();

		// this includes clicking the toggle button
		// an auto-expanded slider would be closed then
		await DiffPage.openSlider();
		const classAttr = await DiffPage.rsAutoExpandButton.getAttribute( 'class' );
		await expect( DiffPage.rsMain ).toBeDisplayed();
		expect( classAttr ).not.toContain( 'oo-ui-toggleWidget-on' );
	} );

	it( ' hides when collapsed manually', async () => {
		await DiffPage.openSlider();
		await DiffPage.rsToggleButton.click();

		await expect( DiffPage.rsMain ).not.toBeDisplayed();
	} );
} );
