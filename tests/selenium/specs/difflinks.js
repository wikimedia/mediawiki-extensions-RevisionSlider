import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider diff links', () => {

	beforeEach( async () => {
		await DiffPage.prepareSimpleTests( 3 );
		await DiffPage.ready();
		await DiffPage.openSlider();
	} );

	it( ' older edit diff link can be clicked', async () => {
		await DiffPage.rsEditOlderButton.click();
		await DiffPage.waitUntilLoaded();

		expect( await DiffPage.isOlderPointerOn( 1 ) ).toBe( true );
		expect( await DiffPage.isNewerPointerOn( 2 ) ).toBe( true );
		expect( await DiffPage.showsOlderSummary( 1 ) ).toBe( true );
		expect( await DiffPage.showsNewerSummary( 2 ) ).toBe( true );
	} );

	it( ' newer edit diff link can be clicked', async () => {
		await DiffPage.rsEditOlderButton.click();
		await DiffPage.waitUntilLoaded();

		await DiffPage.rsEditNewerButton.click();
		await DiffPage.waitUntilLoaded();

		expect( await DiffPage.isOlderPointerOn( 2 ) ).toBe( true );
		expect( await DiffPage.isNewerPointerOn( 3 ) ).toBe( true );
		expect( await DiffPage.showsOlderSummary( 2 ) ).toBe( true );
		expect( await DiffPage.showsNewerSummary( 3 ) ).toBe( true );
	} );
} );
