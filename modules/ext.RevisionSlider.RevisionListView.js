( function ( mw, $ ) {
	var RevisionListView = function ( revisionList ) {
		this.revisionList = revisionList;
	};

	$.extend( RevisionListView.prototype, {
		/**
		 * @type {RevisionList}
		 */
		revisionList: null,

		render: function ( revisionTickWidth ) {
			var $html = $( '<div class="revisions"/>' ),
				revs = this.revisionList.getRevisions(),
				maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() ),
				i, diffSize, $tooltip, relativeChangeSize;

			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5;
				$tooltip = this.makeTooltip( revs[ i ] );

				$html
					.append( $( '<div class="revision" data-revid="' + revs[ i ].getId() + '" data-pos="' + ( i + 1 ) + '" title="' + $tooltip + '"/>' )
						.css( {
							left: revisionTickWidth * i + 'px',
							height: relativeChangeSize + 'px',
							width: revisionTickWidth + 'px',
							top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0,
							background: 'black'
						} )
						.tipsy( {
							gravity: 's',
							html: true,
							fade: true
						} ) )
					.append( $( '<div class="stopper"/>' )
						.css( {
							left: revisionTickWidth * i + 'px',
							width: revisionTickWidth + 'px'
						} ) );
			}

			return $html;
		},

		makeTooltip: function ( rev ) {
			var $tooltip = $( '<center/>' ) // TODO: center is deprecated since 1995
				.append( '<p><b>' + rev.getFormattedDate() + '</b></p>' )
				.append( $( '<p/>' ).text( mw.html.escape( rev.getUser() ) ) )
				.append( rev.getComment() ? $( '<p/>' ).append( '<i/>' ).text( mw.html.escape( rev.getComment() ) ) : '' )
				.append( $( '<p/>' ).html( rev.getSize() + ' bytes' ) )
				.append( rev.isMinor() ? $( '<p/>' ).html( mw.message( 'minoredit' ).text() ) : '' );

			return $( '<div/>' ).append( $tooltip ).html();
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionListView = RevisionListView;
}( mediaWiki, jQuery ) );
