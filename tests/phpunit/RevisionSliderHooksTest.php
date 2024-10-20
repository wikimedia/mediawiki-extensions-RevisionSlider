<?php

use MediaWiki\Config\ConfigFactory;
use MediaWiki\Config\HashConfig;
use MediaWiki\Extension\RevisionSlider\RevisionSliderHooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\Title\Title;
use MediaWiki\User\Options\StaticUserOptionsLookup;
use MediaWiki\User\User;
use Wikimedia\Stats\NullStatsdDataFactory;

/**
 * @covers \MediaWiki\Extension\RevisionSlider\RevisionSliderHooks
 */
class RevisionSliderHooksTest extends \MediaWikiIntegrationTestCase {

	public function testShouldNotLoadWithoutRevisions() {
		// Arrange
		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )
			->willReturn( $this->createMock( Title::class ) );

		$diffEngine = $this->newDiffEngine( null, $output );

		// Assert
		$output->expects( $this->never() )
			->method( 'addModules' );

		// Act
		$this->newInstance()->onDifferenceEngineViewHeader( $diffEngine );
	}

	public function testShouldNotLoadWhenUserIsLoggedInAndDisabledExtension() {
		// Arrange
		$options = [ 'revisionslider-disable' => true ];

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )
			->willReturn( $this->createMock( Title::class ) );

		$revision = $this->createMock( RevisionRecord::class );
		$diffEngine = $this->newDiffEngine( $revision, $output, true );

		// Assert
		$output->expects( $this->never() )
			->method( 'addModules' );

		// Act
		$this->newInstance( $options )->onDifferenceEngineViewHeader( $diffEngine );
	}

	public function testOnGetPreferences() {
		// Arrange
		$user = $this->createMock( User::class );
		$preferences = [];

		// Act
		$this->newInstance()->onGetPreferences( $user, $preferences );

		// Assert
		$this->assertArrayHasKey( 'revisionslider-disable', $preferences );
		$item = $preferences['revisionslider-disable'];
		$this->assertSame( 'toggle', $item['type'] );
		$this->assertSame( 'revisionslider-preference-disable', $item['label-message'] );
		$this->assertSame( 'rendering/diffs', $item['section'] );
	}

	public function newInstance( array $options = [] ): RevisionSliderHooks {
		$configFactory = $this->createMock( ConfigFactory::class );
		$configFactory->method( 'makeConfig' )
			->willReturn( new HashConfig() );

		return new RevisionSliderHooks(
			$configFactory,
			new StaticUserOptionsLookup( [], $options ),
			new NullStatsdDataFactory()
		);
	}

	private function newDiffEngine(
		?RevisionRecord $revision,
		OutputPage $output,
		bool $isNamed = false
	): DifferenceEngine {
		$user = $this->createMock( User::class );
		$user->method( 'isNamed' )
			->willReturn( $isNamed );

		$diffEngine = $this->createMock( DifferenceEngine::class );
		$diffEngine->method( 'getOldRevision' )
			->willReturn( $revision );
		$diffEngine->method( 'getNewRevision' )
			->willReturn( $revision );
		$diffEngine->method( 'getOutput' )
			->willReturn( $output );
		$diffEngine->method( 'getUser' )
			->willReturn( $user );
		return $diffEngine;
	}

}
