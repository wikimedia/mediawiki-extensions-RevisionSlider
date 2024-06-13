'use strict';

const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	BlankPage = require( 'wdio-mediawiki/BlankPage' ),
	Util = require( 'wdio-mediawiki/Util' ),
	USER_BUBBLE_SELECTOR = '.mw-revslider-username-row .mw-revslider-bubble',
	TAG_BUBBLE_SELECTOR = '.mw-revslider-tag-row:last-of-type .mw-revslider-bubble';

class DiffPage extends Page {
	get rsMain() {
		return $( '.mw-revslider-revision-slider' );
	}

	get rsToggleButton() {
		return $( '.mw-revslider-toggle-button' );
	}

	get rsAutoExpandButton() {
		return $( '.mw-revslider-auto-expand-button' );
	}

	get rsLoading() {
		return $( '.mw-revslider-diff-loading' );
	}

	async waitUntilLoaded() {
		await this.rsLoading.waitForDisplayed( { reverse: true } );
	}

	get rsEditOlderButton() {
		return $( '#differences-prevlink' );
	}

	get rsEditNewerButton() {
		return $( '#differences-nextlink' );
	}

	get rsPointerOlder() {
		return $( '.mw-revslider-pointer-older' );
	}

	get rsPointerNewer() {
		return $( '.mw-revslider-pointer-newer' );
	}

	async isOlderPointerOn( num ) {
		return await this.rsPointerOlder.getAttribute( 'data-pos' ) === num.toString();
	}

	async isNewerPointerOn( num ) {
		return await this.rsPointerNewer.getAttribute( 'data-pos' ) === num.toString();
	}

	get rsSummaryOlder() {
		return $( '#mw-diff-otitle3' );
	}

	get rsSummaryNewer() {
		return $( '#mw-diff-ntitle3' );
	}

	async showsOlderSummary( num ) {
		const summary = await this.rsSummaryOlder.getText();
		return await summary.includes( 'Summary ' + num );
	}

	async showsNewerSummary( num ) {
		const summary = await this.rsSummaryNewer.getText();
		return await summary.includes( 'Summary ' + num );
	}

	get rsUserFilterBubble() {
		return $( USER_BUBBLE_SELECTOR );
	}

	get rsTagFilterBubble() {
		return $( TAG_BUBBLE_SELECTOR );
	}

	getRevision( num ) {
		return $( '.mw-revslider-revision[data-pos="' + num + '"]' );
	}

	getRevisionUp( num ) {
		return $(
			'//div[contains(@class,"mw-revslider-revision")][@data-pos="' + num + '"]' +
			'/following-sibling::div[contains(@class,"revision-wrapper-up")]'
		);
	}

	getRevisionDown( num ) {
		return $(
			'//div[contains(@class,"mw-revslider-revision")][@data-pos="' + num + '"]' +
			'/following-sibling::div[contains(@class,"revision-wrapper-down")]'
		);
	}

	getTooltip( num ) {
		return $( '.mw-revslider-revision-tooltip-' + num );
	}

	get backwardsArrow() {
		return $( '.mw-revslider-arrow-backwards' );
	}

	get forwardsArrow() {
		return $( '.mw-revslider-arrow-forwards' );
	}

	async isBackwardsArrowDisabled() {
		return await this.backwardsArrow.getAttribute( 'aria-disabled' ) === 'true';
	}

	async isForwardsArrowDisabled() {
		return await this.forwardsArrow.getAttribute( 'aria-disabled' ) === 'true';
	}

	waitForSliding() {
		this.waitForAnimation( $( '.mw-revslider-revisions-container' ) );
	}

	ready() {
		Util.waitForModuleState( 'ext.RevisionSlider.lazyJs' );
	}

	/**
	 * @param {number} num Number of different edits.
	 * @param {boolean} [showHelp] Display help dialog. Defaults to false.
	 */
	async prepareSimpleTests( num, showHelp = false ) {
		const title = Util.getTestString( 'revisionslider-test-' );
		await BlankPage.open();
		await this.toggleHelpDialog( showHelp );
		await this.addUserEditsToPage( title, num );
		this.open( title );
	}

	async prepareFilterTests() {
		const title = await Util.getTestString( 'revisionslider-test-' );
		await BlankPage.open();
		await this.toggleHelpDialog( false );
		await this.hasPageWithDifferentEdits( title );
		await this.open( title );
	}

	async openSlider() {
		await this.rsToggleButton.click();
		try {
			await this.rsMain.waitForDisplayed( { timeout: 2500 } );
		} catch ( e ) {
			await this.rsToggleButton.click();
			await this.rsMain.waitForDisplayed();
		}
	}

	open( title ) {
		super.openTitle( title, { type: 'revision', diff: '' } );
	}

	get helpDialog() {
		return $( '.mw-revslider-help-dialog' );
	}

	get nextHelpButton() {
		return $( '.mw-revslider-help-next' );
	}

	/**
	 * @param {boolean} [show] Defaults to true.
	 */
	async toggleHelpDialog( show ) {
		const hide = ( show === false ) ? '1' : '0';
		await browser.execute( async function ( h ) {
			await this.localStorage.setItem( 'mw-revslider-hide-help-dialogue', h );
		}, hide );
	}

	async resetAutoExpand() {
		await browser.execute( async function () {
			await this.localStorage.setItem( 'mw-revslider-autoexpand', '0' );
		} );
	}

	/**
	 * Will setup a test page with two user edits, one anonymous edit
	 * and a tagged.
	 *
	 * @param {string} title Article to edit.
	 */
	async hasPageWithDifferentEdits( title ) {
		await this.addUserEditsToPage( title, 2 );
		await this.addTaggedOtherUserEditToPage( title );
		await this.addTaggedEditToPage( title );
	}

	/**
	 * @param {string} title Article to edit.
	 * @param {number} num Number of different edits to add.
	 */
	async addUserEditsToPage( title, num ) {
		await browser.call( async () => {
			const bot = await Api.bot();
			for ( let i = 1; i <= num; i++ ) {
				await bot.edit(
					title,
					'RevisionSlider-Test-Text ' + i,
					'RevisionSlider-Test-Summary ' + i
				);
			}
		} );
	}

	/**
	 * @param {string} title Article to edit.
	 */
	addTaggedEditToPage( title ) {
		browser.call( async () => {
			const bot = await Api.bot();
			return bot.edit(
				title,
				'',
				'RevisionSlider-Test-Tagged',
				{ tags: 'mw-blank' }
			);
		} );
	}

	/**
	 * @param {string} title Article to edit.
	 */
	async addTaggedOtherUserEditToPage( title ) {
		const otherUser = await Util.getTestString( 'User-' );
		const otherUserPassword = await Util.getTestString();
		await browser.call( async () => {
			const bot = await Api.bot();
			return await Api.createAccount( bot, otherUser, otherUserPassword );
		} );

		await browser.call( async () => {
			const bot = await Api.bot( otherUser, otherUserPassword );
			return bot.edit(
				title,
				'RevisionSlider-Test-Other-Text with tag',
				'RevisionSlider-Test-Other-Tagged',
				{ tags: 'mw-replace' }
			);

		} );
	}

	async dwellRevision( num ) {
		await this.getRevision( num ).moveTo();
		await this.getTooltip( num ).waitForDisplayed();
	}

	async dwellTagFilterBubble() {
		await $( TAG_BUBBLE_SELECTOR ).moveTo();
	}

	async abondonBubbleDwell() {
		// make sure we do not dwell the line/bubble after clicking
		await $( '.mw-revslider-revision-tooltip p:first-of-type' ).moveTo();
	}

	async clickUserFilterBubble() {
		await this.rsUserFilterBubble.click();
		await this.abondonBubbleDwell();
	}

	async clickTagFilterBubble() {
		await this.rsTagFilterBubble.click();
		await this.abondonBubbleDwell();
	}

	async highlightsRevision( num ) {
		const attr = await this.getRevision( num ).$( '..' ).getAttribute( 'class' );
		return await attr.includes( 'mw-revslider-revision-filter-highlight' );
	}

	async highlightsBubble( el ) {
		const element = await el.getAttribute( 'class' );
		return await element.includes( 'mw-revslider-filter-highlight-bubble' );
	}

	async dragOlderPointerTo( num ) {
		await this.rsPointerOlder.dragAndDrop( await this.getRevision( num ) );
	}

	async dragNewerPointerTo( num ) {
		await this.rsPointerNewer.dragAndDrop( await this.getRevision( num ) );
	}

	waitForAnimation( el ) {
		browser.execute( ( elem ) => {
			setInterval( () => {
				if ( $( elem ).filter( ':not(animated)' ) ) {
					clearInterval();
				}
			}, 500 );
		}, el );
	}
}

module.exports = new DiffPage();
