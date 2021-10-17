/**
 * Module containing presentation logic for the revision pointer lines
 *
 * @class PointerLine
 * @param {Pointer} pointer
 * @param {string} name
 * @constructor
 */
function PointerLine( pointer, name ) {
	this.pointer = pointer;
	this.name = name;
}

$.extend( PointerLine.prototype, {
	/**
	 * @type {string}
	 */
	name: '',

	/**
	 * @type {Pointer}
	 */
	pointer: null,

	/**
	 * @type {jQuery}
	 */
	$html: null,

	/**
	 * Check if the offset method is available for the diff element
	 *
	 * @return {boolean}
	 */
	offsetNotAvailable: function () {
		return typeof $( '.diff-ntitle' ).offset() === 'undefined';
	},

	/**
	 * Calculate the relative distance in between the given pointer and column
	 *
	 * @param {jQuery} $sourcePointer
	 * @param {jQuery} $targetColumn
	 * @return {number} distance between the given elements
	 */
	calculateDistance: function ( $sourcePointer, $targetColumn ) {
		return ( $targetColumn.offset().left + $targetColumn.width() / 2 ) -
			( $sourcePointer.offset().left + ( $sourcePointer.width() ) / 2 );
	},

	/**
	 * Calculate and set line's width and position with the given pointer and column
	 *
	 * @param {jQuery} $sourcePointer
	 * @param {jQuery} $targetColumn
	 */
	setCssProperties: function ( $sourcePointer, $targetColumn ) {
		var distance = this.calculateDistance( $sourcePointer, $targetColumn );

		var widthToSet = Math.abs( distance );
		var leftToSet = ( $targetColumn.offset().left + $targetColumn.width() / 2 ) -
			$( '.mw-revslider-revision-slider' ).offset().left;

		if ( distance > 0 ) {
			// targetColumn is right relative to sourcePointer
			leftToSet -= widthToSet;
			leftToSet -= 1;
		} else {
			// targetColumn is left relative to sourcePointer
			leftToSet += 1;
		}

		this.$html.css( {
			width: widthToSet + 'px',
			left: leftToSet + 'px'
		} );
	},

	/**
	 * Check if the target column is located right form the source pointer
	 *
	 * @param {jQuery} $sourcePointer
	 * @param {jQuery} $targetColumn
	 *
	 * @return {boolean}
	 */
	targetColumnIsRightFromPointer: function ( $sourcePointer, $targetColumn ) {
		return this.calculateDistance( $sourcePointer, $targetColumn ) > 0;
	},

	/**
	 * Draws the line between pointer and column by setting borders, position and width of the line box
	 *
	 * @return {boolean}
	 */
	drawLine: function () {
		if ( this.offsetNotAvailable() ) {
			// offset is not available in QUnit tests so skip calculation and drawing
			return false;
		}

		var $upperLineDiv = this.$html.find( '.mw-revslider-pointer-line-upper' ),
			$lowerLineDiv = this.$html.find( '.mw-revslider-pointer-line-lower' ),
			$newerUnderLineDiv = this.$html.find( '.mw-revslider-pointer-line-underline.mw-revslider-pointer-newer' ),
			$olderUnderLineDiv = this.$html.find( '.mw-revslider-pointer-line-underline.mw-revslider-pointer-older' ),
			$sourcePointer = this.pointer.getView().getElement(),
			$table = $( '.diff-otitle' );

		var isNewer = this.pointer.getView().isNewerPointer();
		$lowerLineDiv.add( $upperLineDiv ).add( $newerUnderLineDiv ).add( $olderUnderLineDiv )
			.toggleClass( 'mw-revslider-lower-color', !isNewer )
			.toggleClass( 'mw-revslider-upper-color', isNewer );
		var $targetColumn = isNewer ? $( '.diff-ntitle' ) : $table;

		this.setCssProperties( $sourcePointer, $targetColumn );

		$upperLineDiv.addClass( 'mw-revslider-bottom-line' );

		if ( this.targetColumnIsRightFromPointer( $sourcePointer, $targetColumn ) ) {
			$upperLineDiv.addClass( 'mw-revslider-left-line' );
			$lowerLineDiv.addClass( 'mw-revslider-right-line' );

			$( $newerUnderLineDiv ).css( {
				width: $table.width() + 'px',
				'margin-right': -$table.width() / 2 + 'px',
				'margin-left': 0,
				float: 'right'
			} );
			$( $olderUnderLineDiv ).css( {
				width: $table.width() + 'px',
				'margin-right': -$table.width() / 2 + 'px',
				'margin-left': 0,
				float: 'right'
			} );
		} else {
			$upperLineDiv.addClass( 'mw-revslider-right-line' );
			$lowerLineDiv.addClass( 'mw-revslider-left-line' );

			$( $newerUnderLineDiv ).css( {
				width: $table.width() + 'px',
				'margin-left': -$table.width() / 2 + 'px',
				'margin-right': 0,
				float: 'left'
			} );
			$( $olderUnderLineDiv ).css( {
				width: $table.width() + 'px',
				'margin-left': -$table.width() / 2 + 'px',
				'margin-right': 0,
				float: 'left'
			} );
		}

		return true;
	},

	/**
	 * Initializes the DOM element with the line-box for drawing the lines
	 */
	initialize: function () {
		// eslint-disable-next-line mediawiki/class-doc
		this.$html = $( '<div>' )
			.addClass( 'mw-revslider-pointer-line ' + this.name )
			.append(
				// eslint-disable-next-line mediawiki/class-doc
				$( '<div>' ).addClass( 'mw-revslider-pointer-line-upper ' + this.name ),
				// eslint-disable-next-line mediawiki/class-doc
				$( '<div>' ).addClass( 'mw-revslider-pointer-line-lower ' + this.name ),
				// eslint-disable-next-line mediawiki/class-doc
				$( '<div>' ).addClass( 'mw-revslider-pointer-line-underline ' + this.name )
			);
	},

	/**
	 * Adds colored top-borders for the diff columns fitting the line colors between pointers and columns
	 */
	addColoredColumnBorders: function () {
		$( '#mw-diff-otitle1' ).addClass( 'mw-revslider-older-diff-column' );
		$( '#mw-diff-ntitle1' ).addClass( 'mw-revslider-newer-diff-column' );
	},

	/**
	 * Remove colored top-borders for the diff columns fitting the line colors between pointers and columns
	 */
	removeColoredColumnBorders: function () {
		$( '#mw-diff-otitle1' ).removeClass( 'mw-revslider-older-diff-column' );
		$( '#mw-diff-ntitle1' ).removeClass( 'mw-revslider-newer-diff-column' );
	},

	/**
	 * Sets the hooks to draw the column borders
	 */
	setColumnBorderHooks: function () {
		mw.hook( 'wikipage.diff' ).add( this.addColoredColumnBorders );
		mw.hook( 'revslider.expand' ).add( this.addColoredColumnBorders );
		mw.hook( 'revslider.collapse' ).add( this.removeColoredColumnBorders );
	},

	/**
	 * @return {jQuery}
	 */
	render: function () {
		this.initialize();
		this.setColumnBorderHooks();
		return this.getElement();
	},

	/**
	 * @return {jQuery}
	 */
	getElement: function () {
		return this.$html;
	}

} );

module.exports = PointerLine;
