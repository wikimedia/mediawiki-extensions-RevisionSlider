import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider pointers', () => {

	before( async () => {
		await DiffPage.prepareSimpleTests( 3 );
	} );

	beforeEach( async () => {
		await DiffPage.ready();
		await DiffPage.openSlider();
	} );

	afterEach( async () => {
		await browser.refresh();
	} );

	it( ' can be dragged', async () => {
		// The older pointer starts on the previous revision, the newer one on the current
		expect( await DiffPage.isOlderPointerOn( 2 ) ).toBe( true );
		expect( await DiffPage.isNewerPointerOn( 3 ) ).toBe( true );

		await DiffPage.dragOlderPointerTo( 1 );
		await DiffPage.waitUntilLoaded();

		await DiffPage.dragNewerPointerTo( 2 );
		await DiffPage.waitUntilLoaded();

		expect( await DiffPage.isOlderPointerOn( 1 ) ).toBe( true );
		expect( await DiffPage.isNewerPointerOn( 2 ) ).toBe( true );
		// Revisions 1 and 2 should be loaded on the left and right of the diff
		expect( await DiffPage.showsOlderSummary( 1 ) ).toBe( true );
		expect( await DiffPage.showsNewerSummary( 2 ) ).toBe( true );
	} );
} );
