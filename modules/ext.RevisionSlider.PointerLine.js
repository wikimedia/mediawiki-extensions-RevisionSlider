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

Object.assign( PointerLine.prototype, {
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
	 * Calculate the relative distance in between the given pointer and column
	 *
	 * @private
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
	 * @private
	 * @param {jQuery} $sliderView
	 * @param {jQuery} $sourcePointer
	 * @param {jQuery} $targetColumn
	 */
	setCssProperties: function ( $sliderView, $sourcePointer, $targetColumn ) {
		const distance = this.calculateDistance( $sourcePointer, $targetColumn );

		const widthToSet = Math.abs( distance );
		let leftToSet = ( $targetColumn.offset().left + $targetColumn.width() / 2 ) -
			$sliderView.offset().left;

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
	 * @private
	 * @param {jQuery} $sourcePointer
	 * @param {jQuery} $targetColumn
	 * @return {boolean}
	 */
	targetColumnIsRightFromPointer: function ( $sourcePointer, $targetColumn ) {
		return this.calculateDistance( $sourcePointer, $targetColumn ) > 0;
	},

	/**
	 * Draws the line between pointer and column by setting borders, position and width of the line box
	 */
	drawLine: function () {
		const isNewer = this.pointer.getView().isNewerPointer();
		const $sliderView = $( '.mw-revslider-revision-slider' );
		const $targetColumn = $( isNewer ? '.diff-ntitle' : '.diff-otitle' );

		if ( !$sliderView.length || !$targetColumn.length ) {
			return;
		}

		const $upperLineDiv = this.$html.find( '.mw-revslider-pointer-line-upper' ),
			$lowerLineDiv = this.$html.find( '.mw-revslider-pointer-line-lower' ),
			$underline = this.$html.find( '.mw-revslider-pointer-line-underline' ),
			$sourcePointer = this.pointer.getView().getElement();

		$lowerLineDiv.add( $upperLineDiv ).add( $underline )
			.toggleClass( 'mw-revslider-lower-color', !isNewer )
			.toggleClass( 'mw-revslider-upper-color', isNewer );

		this.setCssProperties( $sliderView, $sourcePointer, $targetColumn );

		const columnWidth = $targetColumn.width();
		$upperLineDiv.addClass( 'mw-revslider-bottom-line' );
		$underline.css( 'width', columnWidth + 'px' );

		if ( this.targetColumnIsRightFromPointer( $sourcePointer, $targetColumn ) ) {
			$upperLineDiv.addClass( 'mw-revslider-left-line' );
			$lowerLineDiv.addClass( 'mw-revslider-right-line' );

			$underline.css( {
				'margin-right': -columnWidth / 2 + 'px',
				'margin-left': 0,
				float: 'right'
			} );
		} else {
			$upperLineDiv.addClass( 'mw-revslider-right-line' );
			$lowerLineDiv.addClass( 'mw-revslider-left-line' );

			$underline.css( {
				'margin-left': -columnWidth / 2 + 'px',
				'margin-right': 0,
				float: 'left'
			} );
		}
	},

	/**
	 * Initializes the DOM element with the line-box for drawing the lines
	 *
	 * @private
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
	 * @return {jQuery}
	 */
	getElement: function () {
		if ( !this.$html ) {
			this.initialize();
		}
		return this.$html;
	}

} );

module.exports = PointerLine;
