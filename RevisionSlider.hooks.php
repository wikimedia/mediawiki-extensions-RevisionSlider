<?php

/**
 * RevisionSlider extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0+
 */
class RevisionSliderHooks {

	public static function onDiffViewHeader(
		DifferenceEngine $diff,
		Revision $oldRev,
		Revision $newRev
	) {
		global $wgUser;

		/**
		 * If this extension is deployed with the BetaFeatures extension then require the
		 * current user to have it enabled as a BetaFeature.
		 */
		if (
			class_exists( BetaFeatures::class ) &&
			!BetaFeatures::isFeatureEnabled( $wgUser, 'revisionslider' ) )
		{
			return true;
		}

		$out = RequestContext::getMain()->getOutput();
		$out->addModules( 'ext.RevisionSlider.init' );
		$out->addHTML(
			Html::rawElement(
				'div',
				[
					'id' => 'revision-slider-container',
					'style' => 'min-height: 150px;',
					'data-oldrev' => $oldRev->getId(),
					'data-newrev' => $newRev->getId(),
				],
				Html::element(
					'p',
					[
						'id' => 'revision-slider-placeholder',
						'style' => 'text-align: center',
					],
					( new Message( 'revisionslider-loading-placeholder' ) )->parse()
				) .
				Html::rawElement(
					'noscript',
					[],
					Html::element(
						'p',
						[ 'style' => 'text-align: center' ],
						( new Message( 'revisionslider-loading-noscript' ) )->parse()
					)
				)
			)
		);
		return true;
	}

	public static function getBetaFeaturePreferences( $user, &$prefs ) {
		$prefs['revisionslider'] = [
			'label-message' => 'revisionslider-beta-feature-message',
			'desc-message' => 'revisionslider-beta-feature-description',
			'info-link' => 'https://www.mediawiki.org/wiki/Extension:RevisionSlider',
			'discussion-link' => 'https://www.mediawiki.org/wiki/Extension_talk:RevisionSlider',
		];
	}

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.RevisionSlider.tests'] = [
			'scripts' => [
				'tests/RevisionSlider.Revision.test.js',
				'tests/RevisionSlider.Pointer.test.js',
				'tests/RevisionSlider.PointerView.test.js',
				'tests/RevisionSlider.Slider.test.js',
				'tests/RevisionSlider.SliderView.test.js',
				'tests/RevisionSlider.RevisionList.test.js',
			],
			'dependencies' => [
				'ext.RevisionSlider.Revision',
				'ext.RevisionSlider.Pointer',
				'ext.RevisionSlider.PointerView',
				'ext.RevisionSlider.Slider',
				'ext.RevisionSlider.SliderView',
				'ext.RevisionSlider.RevisionList',
				'jquery.ui.draggable',
				'jquery.ui.tooltip',
				'jquery.tipsy',
			],
			'localBasePath' => __DIR__,
		];

		return true;
	}
}
