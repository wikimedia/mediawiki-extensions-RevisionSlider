import DiffPage from '../pageobjects/diff.page.js';

describe( 'RevisionSlider timeline arrows', () => {

	afterEach( async () => {
		await browser.refresh();
	} );

	it( ' should be disabled with 3 revisions', async () => {
		await DiffPage.prepareSimpleTests( 3 );
		await DiffPage.ready();
		await DiffPage.openSlider();

		expect( await DiffPage.isBackwardsArrowDisabled() ).toBe( true );
		expect( await DiffPage.isForwardsArrowDisabled() ).toBe( true );
	} );

	it( ' should be enabled with adequate revisions', async () => {
		await browser.setWindowSize( 400, 600 );
		await DiffPage.prepareSimpleTests( 20 );
		await DiffPage.ready();
		await DiffPage.openSlider();

		await DiffPage.backwardsArrow.click();
		await DiffPage.waitForSliding();

		expect( await DiffPage.isForwardsArrowDisabled() ).toBe( false );

		await DiffPage.forwardsArrow.click();
		await DiffPage.waitForSliding();

		expect( await DiffPage.isBackwardsArrowDisabled() ).toBe( false );
		expect( await DiffPage.isForwardsArrowDisabled() ).toBe( true );
	} );
} );
