@chrome @en.wikipedia.beta.wmflabs.org @firefox @test2.wikipedia.org @vagrant @integration
Feature: RevisionSlider betafeature
  Background:
    Given I am logged in
    And The page "RevisionSliderTestPage1" has the following edits:
      | RS text        |
      | RS longer text |
      | RS less text   |

  Scenario: RevisionSlider is not loaded when feature disabled
    Given RevisionSlider is disabled as a beta feature
    And I am on the "RevisionSliderTestPage1" diff page
    Then There should not be a RevisionSlider placeholder

  Scenario: RevisionSlider is loaded when feature enabled
    Given RevisionSlider is enabled as a beta feature
    And I am on the "RevisionSliderTestPage1" diff page
    And The RevisionSlider has loaded
    Then There should be a RevisionSlider container