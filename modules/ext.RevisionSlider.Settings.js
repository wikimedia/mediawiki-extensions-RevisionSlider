/**
 * @class Settings
 * @constructor
 */
function Settings() {
	this.hideHelpDialogue = this.loadBoolean( 'hide-help-dialogue' );
	this.autoExpand = this.loadBoolean( 'autoexpand' );
}

Object.assign( Settings.prototype, {
	/**
	 * @type {boolean}
	 */
	hideHelpDialogue: null,

	/**
	 * @type {boolean}
	 */
	autoExpand: null,

	/**
	 * @return {boolean}
	 */
	shouldHideHelpDialogue: function () {
		return this.hideHelpDialogue;
	},

	/**
	 * @return {boolean}
	 */
	shouldAutoExpand: function () {
		return this.autoExpand;
	},

	/**
	 * @param {boolean} newSetting
	 */
	setHideHelpDialogue: function ( newSetting ) {
		if ( newSetting !== this.hideHelpDialogue ) {
			this.saveBoolean( 'hide-help-dialogue', newSetting );
			this.hideHelpDialogue = newSetting;
		}
	},

	/**
	 * @param {boolean} newSetting
	 */
	setAutoExpand: function ( newSetting ) {
		if ( newSetting !== this.autoExpand ) {
			this.saveBoolean( 'autoexpand', newSetting );
			this.autoExpand = newSetting;
		}
	},

	/**
	 * @private
	 * @param {string} name
	 * @param {string} defaultValue
	 * @return {string|boolean}
	 */
	loadSetting: function ( name, defaultValue ) {
		let setting;
		if ( mw.user.isNamed() ) {
			setting = mw.user.options.get( 'userjs-revslider-' + name );
		} else {
			setting = mw.storage.get( 'mw-revslider-' + name ) ||
				mw.cookie.get( '-revslider-' + name );
		}

		return setting !== null && setting !== false ? setting : defaultValue;
	},

	/**
	 * @private
	 * @param {string} name
	 * @param {boolean} [defaultValue]
	 * @return {boolean}
	 */
	loadBoolean: function ( name, defaultValue ) {
		return this.loadSetting( name, defaultValue ? '1' : '0' ) === '1';
	},

	/**
	 * @private
	 * @param {string} name
	 * @param {string} value
	 */
	saveSetting: function ( name, value ) {
		if ( mw.user.isNamed() ) {
			( new mw.Api() ).saveOption( 'userjs-revslider-' + name, value );
		} else {
			if ( !mw.storage.set( 'mw-revslider-' + name, value ) ) {
				mw.cookie.set( '-revslider-' + name, value ); // use cookie when localStorage is not available
			}
		}
	},

	/**
	 * @private
	 * @param {string} name
	 * @param {boolean} value
	 */
	saveBoolean: function ( name, value ) {
		this.saveSetting( name, value ? '1' : '0' );
	}
} );

module.exports = Settings;
