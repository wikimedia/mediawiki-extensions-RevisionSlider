@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider betafeature
  Background:
    Given I am logged in
    And a page with 2 revision(s) exists

  Scenario: RevisionSlider is not loaded when feature disabled
    Given RevisionSlider is disabled as a beta feature
    And I am on the diff page
    Then There should not be a RevisionSlider expand button

  Scenario: RevisionSlider is loaded when feature enabled
    Given RevisionSlider is enabled as a beta feature
    And I am on the diff page
    Then There should be a RevisionSlider expand button