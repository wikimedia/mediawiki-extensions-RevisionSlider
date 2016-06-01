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
			var $html = $( '<div>' ).addClass( 'mw-revisions' ),
				revs = this.revisionList.getRevisions(),
				maxChangeSizeLogged = Math.log( this.revisionList.getBiggestChangeSize() ),
				i, diffSize, tooltip, relativeChangeSize;

			for ( i = 0; i < revs.length; i++ ) {
				diffSize = revs[ i ].getRelativeSize();
				relativeChangeSize = diffSize !== 0 ? Math.ceil( 65.0 * Math.log( Math.abs( diffSize ) ) / maxChangeSizeLogged ) + 5 : 0;
				tooltip = this.makeTooltip( revs[ i ] );

				$html
					.append( $( '<div>' )
						.addClass( 'mw-revision-wrapper' )
						.attr( 'title', tooltip )
						.css( {
							left: revisionTickWidth * i + 'px',
							width: revisionTickWidth + 'px'
						} )
						.tipsy( {
							gravity: 's',
							html: true,
							fade: true,
							className: 'mw-revision-tooltip'
						} )
						.append( $( '<div>' )
							.addClass( 'mw-revision' )
							.attr( 'data-revid', revs[ i ].getId() )
							.attr( 'data-pos', i + 1 )
							.css( {
								height: relativeChangeSize + 'px',
								width: revisionTickWidth + 'px',
								top: diffSize > 0 ? '-' + relativeChangeSize + 'px' : 0
							} )
							.addClass( diffSize > 0 ? 'mw-revision-up' : 'mw-revision-down' )
							.append( $( '<div>' ).addClass( 'mw-revision-border-box' ) )
						)
					);
			}

			return $html;
		},

		makeTooltip: function ( rev ) {
			var $tooltip = $( '<div>' )
				.append(
					$( '<p>' ).append( $( '<b>' ).text( rev.getFormattedDate() ) ),
					rev.getUser() ?
						$( '<bdi>' ).append( $( '<p>' ).text(
							mw.msg( 'revisionslider-label-user', mw.html.escape( rev.getUser() ) )
						) )
						: '',
					rev.getComment() ?
						$( '<bdi>' ).append(
							$( '<p>' ).append( $( '<i>' ).text(
								mw.msg( 'revisionslider-label-comment', mw.html.escape( rev.getComment() ) )
							) )
						)
						: '',
					$( '<p>' ).text(
						mw.msg( 'revisionslider-label-article-size', mw.msg( 'revisionslider-revision-bytes', rev.getSize() ) )
					),
					$( '<p>' ).text(
						mw.msg( 'revisionslider-label-change-size', mw.msg( 'revisionslider-revision-bytes', rev.getRelativeSize() ) )
					),
					rev.isMinor() ? $( '<p>' ).text( mw.message( 'minoredit' ).text() ) : '' );

			return $tooltip.html();
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.RevisionListView = RevisionListView;
}( mediaWiki, jQuery ) );
