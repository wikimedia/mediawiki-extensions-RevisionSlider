<?php

namespace MediaWiki\Extension\RevisionSlider;

use Config;
use ConfigFactory;
use Html;
use Liuggio\StatsdClient\Factory\StatsdDataFactory;
use MediaWiki\Diff\Hook\DifferenceEngineViewHeaderHook;
use MediaWiki\MainConfigNames;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\User\UserOptionsLookup;
use Message;
use OOUI\ButtonWidget;

/**
 * RevisionSlider extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 */
class RevisionSliderHooks implements DifferenceEngineViewHeaderHook, GetPreferencesHook {

	/** @var Config */
	private $config;

	/** @var UserOptionsLookup */
	private $userOptionsLookup;

	/** @var StatsdDataFactory */
	private $statsdDataFactory;

	/**
	 * @param ConfigFactory $configFactory
	 * @param UserOptionsLookup $userOptionsLookup
	 * @param StatsdDataFactory $statsdDataFactory
	 */
	public function __construct(
		ConfigFactory $configFactory,
		UserOptionsLookup $userOptionsLookup,
		StatsdDataFactory $statsdDataFactory
	) {
		$this->config = $configFactory->makeConfig( 'revisionslider' );
		$this->userOptionsLookup = $userOptionsLookup;
		$this->statsdDataFactory = $statsdDataFactory;
	}

	/**
	 * @inheritDoc
	 */
	public function onDifferenceEngineViewHeader( $differenceEngine ) {
		$oldRevRecord = $differenceEngine->getOldRevision();
		$newRevRecord = $differenceEngine->getNewRevision();

		// sometimes the old revision can be null (e.g. missing rev), and perhaps also the
		// new one (T167359)
		if ( $oldRevRecord === null || $newRevRecord === null ) {
			return;
		}

		// do not show on MobileDiff page
		// Note: Since T245172, DifferenceEngine::getTitle() is the title of the page being diffed.
		if ( $differenceEngine->getOutput()->getTitle()->isSpecial( 'MobileDiff' ) ) {
			return;
		}

		/**
		 * If the user is logged in and has explictly requested to disable the extension don't load.
		 */
		$user = $differenceEngine->getUser();
		if ( $user->isRegistered() && $this->userOptionsLookup->getBoolOption( $user, 'revisionslider-disable' ) ) {
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

		$this->statsdDataFactory->increment( 'RevisionSlider.event.hookinit' );

		$timeOffset = 0;
		if ( $this->config->get( MainConfigNames::Localtimezone ) !== null ) {
			$timeOffset = $this->config->get( MainConfigNames::LocalTZoffset ) ?? 0;
		}

		$autoExpand = $this->userOptionsLookup->getBoolOption( $user, 'userjs-revslider-autoexpand' );

		$out = $differenceEngine->getOutput();
		// Load styles on page load to avoid FOUC
		$out->addModuleStyles( 'ext.RevisionSlider.lazyCss' );
		if ( $autoExpand ) {
			$out->addModules( 'ext.RevisionSlider.init' );
			$this->statsdDataFactory->increment( 'RevisionSlider.event.load' );
		} else {
			$out->addModules( 'ext.RevisionSlider.lazyJs' );
			$this->statsdDataFactory->increment( 'RevisionSlider.event.lazyload' );
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
	 * @inheritDoc
	 */
	public function onGetPreferences( $user, &$preferences ) {
		$preferences['revisionslider-disable'] = [
			'type' => 'toggle',
			'label-message' => 'revisionslider-preference-disable',
			'section' => 'rendering/diffs',
		];
	}

}
