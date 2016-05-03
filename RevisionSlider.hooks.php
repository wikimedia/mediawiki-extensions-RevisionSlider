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
		if ( self::shouldLoadRevisionSlider( $skin->getContext()->getRequest() ) ) {
			$out->addModules( 'ext.RevisionSlider.init' );
		}
	}

	private static function shouldLoadRevisionSlider( WebRequest $request ) {
		return $request->getCheck( 'diff' );
	}

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.RevisionSlider.tests'] = [
			'scripts' => [
				'tests/RevisionSlider.Revision.test.js',
			],
			'dependencies' => [
				'ext.RevisionSlider.Revision'
			],
			'localBasePath' => __DIR__,
		];

		return true;
	}
}
