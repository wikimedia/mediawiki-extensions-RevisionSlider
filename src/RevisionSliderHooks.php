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
		$config = MediaWikiServices::getInstance()->getMainConfig();

		/**
		 * If this extension is configured to be a beta feature, and the BetaFeatures extension
		 * is loaded then require the current user to have the feature enabled.
		 */
		if (
			$config->get( 'RevisionSliderBetaFeature' ) &&
			class_exists( BetaFeatures::class ) &&
			!BetaFeatures::isFeatureEnabled( $diff->getUser(), 'revisionslider' )
		) {
			return true;
		}

		/**
		 * If the user is logged in and has explictly requested to disable the extension don't load.
		 */
		$user = $diff->getUser();
		if ( !$user->isAnon() && $user->getBoolOption( 'revisionslider-disable' ) ) {
			return true;
		}

		/**
		 * Do not show the RevisionSlider when revisions from two different pages are being compared
		 */
		if ( !$oldRev->getTitle()->equals( $newRev->getTitle() ) ) {
			return true;
		}

		$stats = MediaWikiServices::getInstance()->getStatsdDataFactory();
		$stats->increment( 'RevisionSlider.event.hookinit' );

		$timeOffset = $config->get( 'LocalTZoffset' );
		if ( is_null( $config->get( 'Localtimezone' ) ) ) {
			$timeOffset = 0;
		} elseif ( is_null( $timeOffset ) ) {
			$timeOffset = 0;
		}

		$autoExpand = $user->getBoolOption( 'userjs-revslider-autoexpand' );

		$out = RequestContext::getMain()->getOutput();
		// Load styles on page load to avoid FOUC
		$out->addModuleStyles( 'ext.RevisionSlider.lazy' );
		if ( $autoExpand ) {
			$out->addModules( 'ext.RevisionSlider.init' );
			$stats->increment( 'RevisionSlider.event.load' );
			if ( $config->get( 'RevisionSliderAlternateSlider' ) ) {
				$out->addModules( 'ext.RevisionSlider.SliderViewTwo' );
			}
		} else {
			$out->addModules( 'ext.RevisionSlider.lazy' );
			$stats->increment( 'RevisionSlider.event.lazyload' );
		}
		$out->addModuleStyles( 'ext.RevisionSlider.noscript' );
		$out->addJsConfigVars( 'extRevisionSliderOldRev', $oldRev->getId() );
		$out->addJsConfigVars( 'extRevisionSliderNewRev', $newRev->getId() );
		$out->addJsConfigVars( 'extRevisionSliderTimeOffset', intval( $timeOffset ) );
		$out->addJsConfigVars(
			'extRevisionSliderAlternateSlider',
			$config->get( 'RevisionSliderAlternateSlider' )
		);
		$out->enableOOUI();

		$toggleButton = new OOUI\ButtonWidget( [
			'label' => ( new Message( 'revisionslider-toggle-label' ) )->text(),
			'icon' => $autoExpand ? 'collapse' : 'expand',
			'classes' => [ 'mw-revslider-toggle-button' ],
			'infusable' => true,
			'framed' => false,
			'title' => ( new Message( 'revisionslider-toggle-title-expand' ) )->text(),
		] );
		$toggleButton->setAttributes( [ 'style' => 'width: 100%; text-align: center;' ] );

		$progressBar = new OOUI\ProgressBarWidget( [ 'progress' => false ] );

		$out->prependHTML(
			Html::rawElement(
				'div', [ 'class' => 'mw-revslider-container' ],
				$toggleButton .
				Html::rawElement(
					'div',
					[
						'class' => 'mw-revslider-slider-wrapper',
						'style' => ( !$autoExpand ? ' display: none;' : '' ),
					],
					Html::rawElement(
						'div', [ 'class' => 'mw-revslider-placeholder' ],
						$progressBar
					)
				)
			)
		);
		return true;
	}

	public static function getBetaFeaturePreferences( User $user, array &$prefs ) {
		$config = MediaWikiServices::getInstance()->getMainConfig();
		$extensionAssetsPath = $config->get( 'ExtensionAssetsPath' );

		if ( $config->get( 'RevisionSliderBetaFeature' ) ) {
			$prefs['revisionslider'] = [
				'label-message' => 'revisionslider-beta-feature-message',
				'desc-message' => 'revisionslider-beta-feature-description',
				'screenshot' => [
					'ltr' => "$extensionAssetsPath/RevisionSlider/resources/RevisionSlider-beta-features-ltr.svg",
					'rtl' => "$extensionAssetsPath/RevisionSlider/resources/RevisionSlider-beta-features-rtl.svg",
				],
				'info-link'
					=> 'https://meta.wikimedia.org/wiki/WMDE_Technical_Wishes/RevisionSlider',
				'discussion-link'
					=> 'https://meta.wikimedia.org/wiki/Talk:WMDE_Technical_Wishes/RevisionSlider',
			];
		}
	}

	public static function onResourceLoaderTestModules( array &$testModules, ResourceLoader $rl ) {
		$testModules['qunit']['ext.RevisionSlider.tests'] = [
			'scripts' => [
				'tests/qunit/QUnit.revisionSlider.testOrSkip.js',
				'tests/qunit/RevisionSlider.Revision.test.js',
				'tests/qunit/RevisionSlider.Pointer.test.js',
				'tests/qunit/RevisionSlider.PointerView.test.js',
				'tests/qunit/RevisionSlider.Slider.test.js',
				'tests/qunit/RevisionSlider.SliderView.test.js',
				'tests/qunit/RevisionSlider.RevisionList.test.js',
				'tests/qunit/RevisionSlider.RevisionListView.test.js',
				'tests/qunit/RevisionSlider.DiffPage.test.js',
				'tests/qunit/RevisionSlider.HelpDialog.test.js',
			],
			'dependencies' => [
				'ext.RevisionSlider.Revision',
				'ext.RevisionSlider.Pointer',
				'ext.RevisionSlider.PointerView',
				'ext.RevisionSlider.Slider',
				'ext.RevisionSlider.SliderView',
				'ext.RevisionSlider.RevisionList',
				'ext.RevisionSlider.RevisionListView',
				'ext.RevisionSlider.DiffPage',
				'ext.RevisionSlider.HelpDialog',
				'jquery.ui.draggable',
				'jquery.ui.tooltip',
				'oojs-ui'
			],
			'localBasePath' => dirname( __DIR__ ),
			'remoteExtPath' => 'RevisionSlider',
		];

		return true;
	}

	public static function onGetPreferences( User $user, array &$preferences ) {
		$config = MediaWikiServices::getInstance()->getMainConfig();
		if ( $config->get( 'RevisionSliderBetaFeature' ) ) {
			return true;
		}

		$preferences['revisionslider-disable'] = [
			'type' => 'toggle',
			'label-message' => 'revisionslider-preference-disable',
			'section' => 'rendering/diffs',
			'default' => $user->getBoolOption( 'revisionslider-disable' ),
		];

		return true;
	}
}
