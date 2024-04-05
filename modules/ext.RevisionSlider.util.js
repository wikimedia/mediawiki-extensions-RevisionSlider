// originally taken from https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
function touchEventConverter( event ) {
	const first = event.changedTouches[ 0 ];

	event.preventDefault();

	const type = {
		touchstart: 'mousedown',
		touchmove: 'mousemove',
		touchend: 'mouseup'
	}[ event.type ];
	if ( !type ) {
		return;
	}

	let simulatedEvent;
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
}

// fixes issues with zoomed Chrome on touch see https://github.com/jquery/jquery/issues/3187
function correctElementOffsets( offset ) {
	const isChrome = /Chrom(e|ium)/i.test( navigator.userAgent );

	// since this problem only seems to appear with Chrome just use this in Chrome
	if ( !isChrome ) {
		return offset;
	}

	// get document element width without scrollbar
	const prevStyle = document.body.style.overflow || '';
	document.body.style.overflow = 'hidden';
	const docWidth = document.documentElement.clientWidth;
	document.body.style.overflow = prevStyle;

	// determine if the viewport has been scaled
	if ( docWidth / window.innerWidth !== 1 ) {
		const docRect = document.documentElement.getBoundingClientRect();
		offset = {
			top: offset.top - window.pageYOffset - docRect.top,
			left: offset.left - window.pageXOffset - docRect.left
		};
	}

	return offset;
}

function calculateRevisionsPerWindow( margin, revisionWidth ) {
	return Math.floor( ( $( '#mw-content-text' ).width() - margin ) / revisionWidth );
}

module.exports = {
	calculateRevisionsPerWindow: calculateRevisionsPerWindow,
	correctElementOffsets: correctElementOffsets,
	touchEventConverter: touchEventConverter
};
