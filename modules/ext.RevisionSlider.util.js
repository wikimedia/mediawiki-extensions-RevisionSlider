( function ( mw, $ ) {
	mw.libs.revisionSlider = mw.libs.revisionSlider || {};

	// originally taken from https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
	mw.libs.revisionSlider.touchEventConverter = function ( event ) {
		var first = event.changedTouches[ 0 ],
			type, simulatedEvent;

		event.preventDefault();

		switch ( event.type ) {
			case 'touchstart':
				type = 'mousedown';
				break;
			case 'touchmove':
				type = 'mousemove';
				break;
			case 'touchend':
				type = 'mouseup';
				break;
			default:
				return;
		}

		if ( typeof MouseEvent !== 'undefined' ) {
			simulatedEvent = new MouseEvent( type, {
				bubbles: true,
				cancelable: true,
				view: window,
				detail: 1,
				screenX: first.screenX,
				screenY: first.screenY,
				clientX: first.clientX,
				clientY: first.clientY,
				button: 0,
				relatedTarget: null
			} );
		} else {
			simulatedEvent = document.createEvent( 'MouseEvent' );
			simulatedEvent.initMouseEvent(
				type, true, true, window, 1,
				first.screenX, first.screenY,
				first.clientX, first.clientY,
				false, false, false, false,
				0, null
			);
		}

		first.target.dispatchEvent( simulatedEvent );
	};

	// fixes issues with zoomed Chrome on touch see https://github.com/jquery/jquery/issues/3187
	mw.libs.revisionSlider.correctElementOffsets = function ( offset ) {
		var prevStyle, docWidth, docRect,
			isChrome = /chrom(e|ium)/.test( navigator.userAgent.toLowerCase() );

		// since this problem only seems to appear with Chrome just use this in Chrome
		if ( !isChrome ) {
			return offset;
		}

		// get document element width without scrollbar
		prevStyle = document.body.style.overflow || '';
		document.body.style.overflow = 'hidden';
		docWidth = document.documentElement.clientWidth;
		document.body.style.overflow = prevStyle;

		// determine if the viewport has been scaled
		if ( docWidth / window.innerWidth !== 1 ) {
			docRect = document.documentElement.getBoundingClientRect();
			offset = {
				top: offset.top - window.pageYOffset - docRect.top,
				left: offset.left - window.pageXOffset - docRect.left
			};
		}

		return offset;
	};

	mw.libs.revisionSlider.calculateRevisionsPerWindow = function ( margin, revisionWidth ) {
		return Math.floor( ( $( '#mw-content-text' ).width() - margin ) / revisionWidth );
	};
}( mediaWiki, jQuery ) );
