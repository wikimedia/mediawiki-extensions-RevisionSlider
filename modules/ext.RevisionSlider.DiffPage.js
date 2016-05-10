( function ( mw, $ ) {
	var DiffPage = function () {
	};

	$.extend( DiffPage.prototype, {
		refresh: function ( oldId, newId ) {
			$.ajax( {
				url: mw.util.wikiScript( 'index' ),
				data: {
					diff: newId,
					oldid: oldId
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
