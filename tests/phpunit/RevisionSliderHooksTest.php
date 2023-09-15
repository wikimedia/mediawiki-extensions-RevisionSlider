<?php

use MediaWiki\Extension\RevisionSlider\RevisionSliderHooks;
use MediaWiki\Revision\RevisionRecord;
use MediaWiki\User\StaticUserOptionsLookup;

/**
 * @covers \MediaWiki\Extension\RevisionSlider\RevisionSliderHooks
 */
class RevisionSliderHooksTest extends \MediaWikiIntegrationTestCase {

	public function testShouldNotLoadWithoutRevisions() {
		// Assert
		$output = null;

		// Arrange
		$diffEngine = $this->newDiffEngine( null, $output );

		// Act
		$this->newInstance()->onDifferenceEngineViewHeader( $diffEngine );
	}

	public function testShouldNotLoadOnMobileDiff() {
		// Arrange
		$title = $this->createMock( Title::class );
		$title->method( 'isSpecial' )
			->with( 'MobileDiff' )
			->willReturn( true );

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )
			->willReturn( $title );

		$revision = $this->createMock( RevisionRecord::class );
		$diffEngine = $this->newDiffEngine( $revision, $output );

		// Assert
		$output->expects( $this->never() )
			->method( 'addModules' );

		// Act
		$this->newInstance()->onDifferenceEngineViewHeader( $diffEngine );
	}

	public function testShouldNotLoadWhenUserIsLoggedInAndDisabledExtension() {
		// Arrange
		$options = [ 'revisionslider-disable' => true ];
		$user = $this->createMock( User::class );
		$user->method( 'isNamed' )
			->willReturn( true );

		$output = $this->createMock( OutputPage::class );
		$output->method( 'getTitle' )
			->willReturn( $this->createMock( Title::class ) );

		$revision = $this->createMock( RevisionRecord::class );
		$diffEngine = $this->newDiffEngine( $revision, $output, $user );

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
		?OutputPage $output,
		?User $user = null
	): DifferenceEngine {
		$diffEngine = $this->createMock( DifferenceEngine::class );
		$diffEngine->method( 'getOldRevision' )
			->willReturn( $revision );
		$diffEngine->method( 'getNewRevision' )
			->willReturn( $revision );
		$diffEngine->expects( $output ? $this->atLeastOnce() : $this->never() )
			->method( 'getOutput' )
			->willReturn( $output );
		$diffEngine->expects( $user ? $this->once() : $this->never() )
			->method( 'getUser' )
			->willReturn( $user );
		return $diffEngine;
	}

}
