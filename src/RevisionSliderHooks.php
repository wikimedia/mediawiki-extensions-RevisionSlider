<?php

namespace MediaWiki\Extension\RevisionSlider;

use MediaWiki\Config\Config;
use MediaWiki\Config\ConfigFactory;
use MediaWiki\Diff\Hook\DifferenceEngineViewHeaderHook;
use MediaWiki\Html\Html;
use MediaWiki\MainConfigNames;
use MediaWiki\Message\Message;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use OOUI\ButtonWidget;
use Wikimedia\Stats\Metrics\CounterMetric;
use Wikimedia\Stats\StatsFactory;

/**
 * RevisionSlider extension hooks
 *
 * @file
 * @ingroup Extensions
 * @license GPL-2.0-or-later
 */
class RevisionSliderHooks implements DifferenceEngineViewHeaderHook, GetPreferencesHook {

	private readonly Config $config;
	private readonly CounterMetric $eventsCounter;

	public function __construct(
		ConfigFactory $configFactory,
		private readonly UserOptionsLookup $userOptionsLookup,
		StatsFactory $statsFactory,
	) {
		$this->config = $configFactory->makeConfig( 'revisionslider' );
		$this->eventsCounter = $statsFactory->getCounter( 'RevisionSlider_events_total' )
			->setLabel( 'event', 'n/a' );
	}

	/**
	 * @inheritDoc
	 */
	public function onDifferenceEngineViewHeader( $differenceEngine ) {
		$oldRevRecord = $differenceEngine->getOldRevision();
		$newRevRecord = $differenceEngine->getNewRevision();

		/**
		 * If the user is logged in and has explictly requested to disable the extension don't load.
		 */
		$user = $differenceEngine->getUser();
		if ( $this->isDisabled( $user ) || !$this->isSamePage( $oldRevRecord, $newRevRecord ) ) {
			return;
		}

		$this->eventsCounter->setLabel( 'event', 'hookinit' )
			->copyToStatsdAt( 'RevisionSlider.event.hookinit' )
			->increment();

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
			$this->eventsCounter->setLabel( 'event', 'load' )
				->copyToStatsdAt( 'RevisionSlider.event.load' )
				->increment();
		} else {
			$out->addModules( 'ext.RevisionSlider.lazyJs' );
			$this->eventsCounter->setLabel( 'event', 'lazyload' )
				->copyToStatsdAt( 'RevisionSlider.event.lazyload' )
				->increment();
		}
		$out->addJsConfigVars( 'extRevisionSliderTimeOffset', $timeOffset );
		$out->enableOOUI();

		$out->prependHTML( $this->getContainerHtml( $autoExpand ) );
	}

	public function isDisabled( User $user ): bool {
		return $user->isNamed() &&
			$this->userOptionsLookup->getBoolOption( $user, 'revisionslider-disable' );
	}

	private function isSamePage( ?RevisionRecord $oldRevRecord, ?RevisionRecord $newRevRecord ): bool {
		// sometimes the old revision can be null (e.g. missing rev), and perhaps also the
		// new one (T167359)
		if ( !$oldRevRecord || !$newRevRecord ) {
			return false;
		}

		/**
		 * Do not show the RevisionSlider when revisions from two different pages are being compared
		 *
		 * Since RevisionRecord::getPageAsLinkTarget only returns a LinkTarget, which doesn't
		 * have an equals method, compare manually by namespace and text
		 */
		$oldTitle = $oldRevRecord->getPageAsLinkTarget();
		$newTitle = $newRevRecord->getPageAsLinkTarget();
		return $oldTitle->getNamespace() === $newTitle->getNamespace() &&
			$oldTitle->getDBKey() === $newTitle->getDBKey();
	}

	private function getContainerHtml( bool $autoExpand ): string {
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

		return Html::rawElement( 'div',
			[ 'class' => 'mw-revslider-container' ],
			$toggleButton .
			Html::rawElement( 'div',
				[
					'class' => 'mw-revslider-slider-wrapper',
					'style' => $autoExpand ? null : 'display: none;',
				],
				Html::rawElement( 'div',
					[ 'class' => 'mw-revslider-placeholder' ],
					$loadingSpinner
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
