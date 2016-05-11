( function ( mw, $ ) {
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		refresh: function ( revId1, revId2 ) {
			$( 'body' )
				.find( 'table.diff[data-mw=\'interface\']' )
				.append( '<div id="revision-slider-darkness"></div>' );
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: Math.max( revId1, revId2 ),
					oldid: Math.min( revId1, revId2 )
				},
				success: function ( data ) {
					data = $( '<div/>' ).html( data ).contents();
					$( 'body' )
						.find( 'table.diff[data-mw=\'interface\']' )
						.html( data.find( 'table.diff[data-mw=\'interface\']' ) );
				}
			} );
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.DiffPage = DiffPage;
}( mediaWiki, jQuery ) );
