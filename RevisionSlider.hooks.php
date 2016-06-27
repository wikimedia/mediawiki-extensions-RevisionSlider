<?php
use MediaWiki\MediaWikiServices;

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

		$config = MediaWikiServices::getInstance()->getMainConfig();
		$timeOffset = $config->get( 'LocalTZoffset' );
		if ( is_null( $config->get( 'Localtimezone' ) ) ) {
			$timeOffset = 0;
		} elseif ( is_null( $timeOffset ) ) {
			$timeOffset = 0;
		}

		$out = RequestContext::getMain()->getOutput();
		$out->addModules( 'ext.RevisionSlider.init' );
		$out->addModuleStyles( 'ext.RevisionSlider.noscript' );
		$out->addJsConfigVars( 'extRevisionSliderOldRev', $oldRev->getId() );
		$out->addJsConfigVars( 'extRevisionSliderNewRev', $newRev->getId() );
		$out->addJsConfigVars( 'extRevisionSliderTimeOffset', intval( $timeOffset ) );
		$out->addHTML(
			Html::rawElement(
				'div',
				[
					'id' => 'mw-revision-slider-container',
					'style' => 'min-height: 150px;',
				],
				Html::element(
					'p',
					[
						'id' => 'mw-revision-slider-placeholder',
						'style' => 'text-align: center',
					],
					( new Message( 'revisionslider-loading-placeholder' ) )->text()
				)
			)
		);
		return true;
	}

	public static function getBetaFeaturePreferences( $user, &$prefs ) {
		global $wgExtensionAssetsPath;

		$prefs['revisionslider'] = [
			'label-message' => 'revisionslider-beta-feature-message',
			'desc-message' => 'revisionslider-beta-feature-description',
			'screenshot' => [
				'ltr' => "$wgExtensionAssetsPath/RevisionSlider/resources/RevisionSlider-beta-features-ltr.png",
				'rtl' => "$wgExtensionAssetsPath/RevisionSlider/resources/RevisionSlider-beta-features-rtl.png",
			],
			'info-link' => 'https://www.mediawiki.org/wiki/Extension:RevisionSlider',
			'discussion-link' => 'https://www.mediawiki.org/wiki/Extension_talk:RevisionSlider',
		];
	}

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.RevisionSlider.tests'] = [
			'scripts' => [
				'tests/qunit/RevisionSlider.Revision.test.js',
				'tests/qunit/RevisionSlider.Pointer.test.js',
				'tests/qunit/RevisionSlider.PointerView.test.js',
				'tests/qunit/RevisionSlider.Slider.test.js',
				'tests/qunit/RevisionSlider.SliderView.test.js',
				'tests/qunit/RevisionSlider.RevisionList.test.js',
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
