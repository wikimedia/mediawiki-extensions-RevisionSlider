( function ( mw, $ ) {
	var SectionLegend = function ( revisionList ) {
		this.revisionList = revisionList;
	};

	$.extend( SectionLegend.prototype, {
		/**
		 * @type {RevisionList}
		 */
		revisionList: null,

		getSectionColorMap: function () {
			var sectionMap = [],
				revisions = this.revisionList.getRevisions(),
				section, i;

			for ( i = 1; i < revisions.length; i++ ) {
				section = revisions[ i ].getSection();
				if ( section.length > 0 && !( section in sectionMap ) ) {
					sectionMap[ section ] = '';
				}
			}

			i = 0;
			for ( section in sectionMap ) {
				sectionMap[ section ] = mw.libs.revisionSlider.rainbow( Object.keys( sectionMap ).length, i );
				i++;
			}

			return sectionMap;
		},

		getHtml: function () {
			var sectionMap = this.getSectionColorMap(),
				html = '<div class="revisions-legend">',
				sectionName;
			for ( sectionName in sectionMap ) {
				html += '<span class="rvslider-legend-box" style="color:' + sectionMap[ sectionName ] + ';"> ■</span>' + sectionName;
			}
			return html + '</div>';
		}
	} );

	mw.libs.revisionSlider = mw.libs.revisionSlider || {};
	mw.libs.revisionSlider.SectionLegend = SectionLegend;
}( mediaWiki, jQuery ) );
