<?php

/**
 * Minimal set of classes necessary to fulfill needs of parts of the RevisionSlider relying on
 * the BetaFeatures extension.
 * @codingStandardsIgnoreFile
 */

class BetaFeatures {
	/**
	 * Check if a user has a beta feature enabled.
	 *
	 * @param User $user The user to check
	 * @param string $feature The key passed back to BetaFeatures
	 *     from the GetBetaFeaturePreferences hook
	 * @return bool
	 */
	public static function isFeatureEnabled( $user, $feature ) {
	}
}