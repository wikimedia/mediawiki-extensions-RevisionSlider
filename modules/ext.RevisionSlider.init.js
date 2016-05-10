( function ( mw, $ ) {

	// Function called when a tick on the slider is clicked
	// Params: v1 - Left revision ID; v2 - Right revision ID
	// function refresh( v1, v2 ) {
	// 	if( v1 === -1 || v2 === -1 ) return;
	//
	// 	var $url = gServer + gScript + '?title=' + gPageName + '&diff=' + v2 + '&oldid=' + v1;
	// 	location.href = $url;
	// }

	// function getSectionLegend( revs ) {
	// 	var revData = getComposedRevData( revs ),
	// 		html = '<div class="revisions-legend">',
	// 		sectionName;
	// 	for ( sectionName in revData.sectionMap ) {
	// 		html += '<span class="rvslider-legend-box" style="color:' + revData.sectionMap[ sectionName ] + ';"> ■</span>' + sectionName;
	// 	}
	// 	return html + '</div>';
	// }

	mw.loader.using( [ 'jquery.ui.draggable', 'jquery.ui.tooltip', 'jquery.tipsy' ], function () {
		$( function () {
			mw.libs.revisionSlider.fetchRevisions( {
				pageName: mw.config.get( 'wgPageName' ),
				startId: mw.config.get( 'wgCurRevisionId' ),

				success: function ( data ) {
					var revs = data.query.pages[ 0 ].revisions,
						revisionList,
						$container,
						slider;
					if ( !revs ) {
						return;
					}
					revs.reverse();

					revisionList = new mw.libs.revisionSlider.RevisionList( revs );
					$container = $( '#revision-slider-container' );
					slider = new mw.libs.revisionSlider.Slider( revisionList );
					slider.getView().render( $container );

					$( '#revision-slider-placeholder' ).remove();

					// TODO add the legend back!
				}
			} );
		} );
	} );

}( mediaWiki, jQuery ) );
