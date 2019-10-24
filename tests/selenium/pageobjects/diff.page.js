const Page = require( 'wdio-mediawiki/Page' ),
	Api = require( 'wdio-mediawiki/Api' ),
	BlankPage = require( 'wdio-mediawiki/BlankPage' ),
	Util = require( 'wdio-mediawiki/Util' ),
	MWBot = require( 'mwbot' ),
	USER_BUBBLE_SELECTOR = '.mw-revslider-username-row .mw-revslider-bubble',
	TAG_BUBBLE_SELECTOR = '.mw-revslider-tag-row:last-of-type .mw-revslider-bubble';

class DiffPage extends Page {
	get rsMain() { return browser.element( '.mw-revslider-revision-slider' ); }
	get rsToggleButton() { return browser.element( '.mw-revslider-toggle-button' ); }

	get rsUserFilterBubble() { return browser.element( USER_BUBBLE_SELECTOR ); }
	get rsTagFilterBubble() { return browser.element( TAG_BUBBLE_SELECTOR ); }

	getRevision( num ) { return browser.element( '.mw-revslider-revision[data-pos="' + num + '"]' ); }

	ready() {
		Util.waitForModuleState( 'ext.RevisionSlider.lazyJs' );
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
		this.rsMain.waitForVisible();
	}

	open( title ) {
		super.openTitle( title, { type: 'revision', diff: '' } );
	}

	/**
	 * @param {boolean} [show] Defaults to true.
	 */
	toggleHelpDialog( show ) {
		const hide = show === false;
		browser.localStorage( 'POST', { key: 'mw-revslider-hide-help-dialogue', value: hide ? '1' : '0' } );
	}

	/**
	 * Will setup a test page with two user edits, one anonymous edit
	 * and a tagged.
	 *
	 * @param {string} title Article to edit.
	 */
	hasPageWithDifferentEdits( title ) {
		this.addTwoUserEditsToPage( title );
		this.addTaggedOtherUserEditToPage( title );
		this.addTaggedEditToPage( title );
	}

	/**
	 * @param {string} title Article to edit.
	 */
	addTwoUserEditsToPage( title ) {
		browser.call( function () {
			return Api.edit(
				title,
				'RevisionSlider-Test-Text One'
			);
		} );
		browser.call( function () {
			return Api.edit(
				title,
				'RevisionSlider-Test-Text Two'
			);
		} );
	}

	/**
	 * @param {string} title Article to edit.
	 */
	addTaggedEditToPage( title ) {
		const bot = new MWBot();

		browser.call( function () {
			return bot.loginGetEditToken( {
				apiUrl: `${browser.options.baseUrl}/api.php`,
				username: browser.options.username,
				password: browser.options.password
			} ).then( function () {
				return bot.edit(
					title,
					'',
					'RevisionSlider-Test-Tagged',
					{ tags: 'mw-blank' }
				);
			} );
		} );
	}

	/**
	 * @param {string} title Article to edit.
	 */
	addTaggedOtherUserEditToPage( title ) {
		const bot = new MWBot();
		const otherUser = Util.getTestString( 'User-' );
		const otherUserPassword = Util.getTestString();
		browser.call( function () {
			return Api.createAccount( otherUser, otherUserPassword );
		} );

		browser.call( function () {
			return bot.loginGetEditToken( {
				apiUrl: `${browser.options.baseUrl}/api.php`,
				username: otherUser,
				password: otherUserPassword
			} ).then( function () {
				return bot.edit(
					title,
					'RevisionSlider-Test-Other-Text with tag',
					'RevisionSlider-Test-Other-Tagged',
					{ tags: 'mw-replace' }
				);
			} );
		} );
	}

	dwellRevision( num ) {
		browser.moveToObject( '.mw-revslider-revision[data-pos="' + num + '"]' );
		browser.waitForVisible( '.mw-revslider-revision-tooltip-' + num );
	}

	dwellTagFilterBubble() {
		browser.moveToObject( TAG_BUBBLE_SELECTOR );
	}

	abondonBubbleDwell() {
		// make sure we do not dwell the line/bubble after clicking
		browser.moveToObject( '.mw-revslider-revision-tooltip p:first-of-type' );
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
