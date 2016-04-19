<?php

/**
 * RevisionSlider extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0+
 */
class RevisionSliderHooks {
	public static function onBeforePageDisplay( OutputPage $out, Skin $skin ) {
		if ( self::isRevisionPage( $skin->getContext()->getRequest() ) ) {
			$out->addModules( 'ext.RevisionSlider.init' );
		}
	}

	private static function isRevisionPage( WebRequest $request ) {
		return $request->getVal( 'action' ) === 'history' || $request->getVal( 'type' ) === 'revision';
	}
}
