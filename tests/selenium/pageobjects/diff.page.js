'use strict';

const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	BlankPage = require( 'wdio-mediawiki/BlankPage' ),
	Util = require( 'wdio-mediawiki/Util' ),
	USER_BUBBLE_SELECTOR = '.mw-revslider-username-row .mw-revslider-bubble',
	TAG_BUBBLE_SELECTOR = '.mw-revslider-tag-row:last-of-type .mw-revslider-bubble';

class DiffPage extends Page {
	get rsMain() { return $( '.mw-revslider-revision-slider' ); }
	get rsToggleButton() { return $( '.mw-revslider-toggle-button' ); }
	get rsAutoExpandButton() { return $( '.mw-revslider-auto-expand-button' ); }
	get rsLoading() { return $( '.mw-revslider-diff-loading' ); }

	get rsEditOlderButton() { return $( '#differences-prevlink' ); }
	get rsEditNewerButton() { return $( '#differences-nextlink' ); }

	get rsPointerOlder() { return $( '.mw-revslider-pointer-older' ); }
	get rsPointerNewer() { return $( '.mw-revslider-pointer-newer' ); }
	isOlderPointerOn( num ) {
		return this.rsPointerOlder.getAttribute( 'data-pos' ) === num.toString();
	}
	isNewerPointerOn( num ) {
		return this.rsPointerNewer.getAttribute( 'data-pos' ) === num.toString();
	}

	get rsSummaryOlder() { return $( '#mw-diff-otitle3' ); }
	get rsSummaryNewer() { return $( '#mw-diff-ntitle3' ); }
	showsOlderSummary( num ) {
		return this.rsSummaryOlder.getText().indexOf( 'Summary ' + num ) !== -1;
	}
	showsNewerSummary( num ) {
		return this.rsSummaryNewer.getText().indexOf( 'Summary ' + num ) !== -1;
	}

	get rsUserFilterBubble() { return $( USER_BUBBLE_SELECTOR ); }
	get rsTagFilterBubble() { return $( TAG_BUBBLE_SELECTOR ); }

	getRevision( num ) { return $( '.mw-revslider-revision[data-pos="' + num + '"]' ); }
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

	ready() {
		Util.waitForModuleState( 'ext.RevisionSlider.lazyJs' );
	}

	/**
	 * @param {number} num Number of different edits.
	 */
	prepareSimpleTests( num ) {
		const title = Util.getTestString( 'revisionslider-test-' );
		BlankPage.open();
		this.toggleHelpDialog( false );
		this.addUserEditsToPage( title, num );
		this.open( title );
	}

	prepareFilterTests() {
		const title = Util.getTestString( 'revisionslider-test-' );
		BlankPage.open();
		this.toggleHelpDialog( false );
		this.hasPageWithDifferentEdits( title );
		this.open( title );
	}

	openSlider() {
		this.rsToggleButton.click();
		this.rsMain.waitForDisplayed( { timeout: 10000 } );
	}

	open( title ) {
		super.openTitle( title, { type: 'revision', diff: '' } );
	}

	/**
	 * @param {boolean} [show] Defaults to true.
	 */
	toggleHelpDialog( show ) {
		const hide = ( show === false ) ? '1' : '0';
		browser.execute( function ( h ) {
			this.localStorage.setItem( 'mw-revslider-hide-help-dialogue', h );
		}, hide );
	}

	resetAutoExpand() {
		browser.execute( function () {
			this.localStorage.setItem( 'mw-revslider-autoexpand', '0' );
		} );
	}

	/**
	 * Will setup a test page with two user edits, one anonymous edit
	 * and a tagged.
	 *
	 * @param {string} title Article to edit.
	 */
	hasPageWithDifferentEdits( title ) {
		this.addUserEditsToPage( title, 2 );
		this.addTaggedOtherUserEditToPage( title );
		this.addTaggedEditToPage( title );
	}

	/**
	 * @param {string} title Article to edit.
	 * @param {number} num Number of different edits to add.
	 */
	addUserEditsToPage( title, num ) {
		for ( let i = 1; i <= num; i++ ) {
			browser.call( async () => {
				const bot = await Api.bot();
				return bot.edit(
					title,
					'RevisionSlider-Test-Text ' + i,
					'RevisionSlider-Test-Summary ' + i
				);
			} );
		}
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
	addTaggedOtherUserEditToPage( title ) {
		const otherUser = Util.getTestString( 'User-' );
		const otherUserPassword = Util.getTestString();
		browser.call( async () => {
			const bot = await Api.bot();
			return await Api.createAccount( bot, otherUser, otherUserPassword );
		} );

		browser.call( async () => {
			const bot = await Api.bot( otherUser, otherUserPassword );
			return bot.edit(
				title,
				'RevisionSlider-Test-Other-Text with tag',
				'RevisionSlider-Test-Other-Tagged',
				{ tags: 'mw-replace' }
			);

		} );
	}

	waitUntilFinishedLoading() {
		this.rsLoading.waitForExist( {
			timeout: 2000,
			reverse: true
		} );
	}

	dwellRevision( num ) {
		$( '.mw-revslider-revision[data-pos="' + num + '"]' ).moveTo();
		$( '.mw-revslider-revision-tooltip-' + num ).waitForDisplayed();
	}

	dwellTagFilterBubble() {
		$( TAG_BUBBLE_SELECTOR ).moveTo();
	}

	abondonBubbleDwell() {
		// make sure we do not dwell the line/bubble after clicking
		$( '.mw-revslider-revision-tooltip p:first-of-type' ).moveTo();
	}

	clickUserFilterBubble() {
		this.rsUserFilterBubble.click();
		this.abondonBubbleDwell();
	}

	clickTagFilterBubble() {
		this.rsTagFilterBubble.click();
		this.abondonBubbleDwell();
	}

	highlightsRevision( num ) {
		return this.getRevision( num ).$( '..' )
			.getAttribute( 'class' ).indexOf( 'mw-revslider-revision-highlight' ) !== -1;
	}

	highlightsBubble( el ) {
		return el.getAttribute( 'class' ).indexOf( 'mw-revslider-highlite-bubble' ) !== -1;
	}
}

module.exports = new DiffPage();
