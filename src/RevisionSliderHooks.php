<?php

namespace MediaWiki\Extension\RevisionSlider;

use Config;
use DifferenceEngine;
use Html;
use MediaWiki\MediaWikiServices;
use Message;
use OOUI\ButtonWidget;
use User;

/**
 * RevisionSlider extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 */
class RevisionSliderHooks {

	/**
	 * @return Config The RevisionSlider extensions config
	 */
	private static function getConfig(): Config {
		return MediaWikiServices::getInstance()->getConfigFactory()
			->makeConfig( 'revisionslider' );
	}

	/**
	 * @param DifferenceEngine $diff
	 */
	public static function onDifferenceEngineViewHeader( DifferenceEngine $diff ) {
		$oldRevRecord = $diff->getOldRevision();
		$newRevRecord = $diff->getNewRevision();

		// sometimes the old revision can be null (e.g. missing rev), and perhaps also the
		// new one (T167359)
		if ( $oldRevRecord === null || $newRevRecord === null ) {
			return;
		}

		// do not show on MobileDiff page
		// Note: Since T245172, DifferenceEngine::getTitle() is the title of the page being diffed.
		if ( $diff->getOutput()->getTitle()->isSpecial( 'MobileDiff' ) ) {
			return;
		}

		$services = MediaWikiServices::getInstance();
		$userOptionsLookup = $services->getUserOptionsLookup();

		/**
		 * If the user is logged in and has explictly requested to disable the extension don't load.
		 */
		$user = $diff->getUser();
		if ( $user->isRegistered() && $userOptionsLookup->getBoolOption( $user, 'revisionslider-disable' ) ) {
			return;
		}

		/**
		 * Do not show the RevisionSlider when revisions from two different pages are being compared
		 *
		 * Since RevisionRecord::getPageAsLinkTarget only returns a LinkTarget, which doesn't
		 * have an equals method, compare manually by namespace and text
		 */
		$oldTitle = $oldRevRecord->getPageAsLinkTarget();
		$newTitle = $newRevRecord->getPageAsLinkTarget();
		if ( $oldTitle->getNamespace() !== $newTitle->getNamespace() ||
			$oldTitle->getDBKey() !== $newTitle->getDBKey()
		) {
			return;
		}

		$stats = $services->getStatsdDataFactory();
		$stats->increment( 'RevisionSlider.event.hookinit' );

		$config = self::getConfig();
		$timeOffset = $config->get( 'LocalTZoffset' );
		if ( $config->get( 'Localtimezone' ) === null ) {
			$timeOffset = 0;
		} elseif ( $timeOffset === null ) {
			$timeOffset = 0;
		}

		$autoExpand = $userOptionsLookup->getBoolOption( $user, 'userjs-revslider-autoexpand' );

		$out = $diff->getOutput();
		// Load styles on page load to avoid FOUC
		$out->addModuleStyles( 'ext.RevisionSlider.lazyCss' );
		if ( $autoExpand ) {
			$out->addModules( 'ext.RevisionSlider.init' );
			$stats->increment( 'RevisionSlider.event.load' );
		} else {
			$out->addModules( 'ext.RevisionSlider.lazyJs' );
			$stats->increment( 'RevisionSlider.event.lazyload' );
		}
		$out->addModuleStyles( 'ext.RevisionSlider.noscript' );
		$out->addJsConfigVars( 'extRevisionSliderTimeOffset', intval( $timeOffset ) );
		$out->enableOOUI();

		$toggleButton = new ButtonWidget( [
			'label' => ( new Message( 'revisionslider-toggle-label' ) )->text(),
			'indicator' => 'down',
			'classes' => [ 'mw-revslider-toggle-button' ],
			'infusable' => true,
			'framed' => false,
			'title' => ( new Message( 'revisionslider-toggle-title-expand' ) )->text(),
		] );
		$toggleButton->setAttributes( [ 'style' => 'width: 100%; text-align: center;' ] );

		$loadingSpinner = Html::rawElement(
			'div', [ 'class' => 'mw-revslider-spinner' ],
			Html::element(
				'div', [ 'class' => 'mw-revslider-bounce' ]
			)
		);

		$out->prependHTML(
			Html::rawElement(
				'div',
				[
					'class' => 'mw-revslider-container',
					'aria-hidden' => 'true'
				],
				$toggleButton .
				Html::rawElement(
					'div',
					[
						'class' => 'mw-revslider-slider-wrapper',
						'style' => ( !$autoExpand ? ' display: none;' : '' ),
					],
					Html::rawElement(
						'div', [ 'class' => 'mw-revslider-placeholder' ],
						$loadingSpinner
					)
				)
			)
		);
	}

	/**
	 * @param User $user
	 * @param array[] &$preferences
	 */
	public static function onGetPreferences( User $user, array &$preferences ) {
		$preferences['revisionslider-disable'] = [
			'type' => 'toggle',
			'label-message' => 'revisionslider-preference-disable',
			'section' => 'rendering/diffs',
		];
	}

}
