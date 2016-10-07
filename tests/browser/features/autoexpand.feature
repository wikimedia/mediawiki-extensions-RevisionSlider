@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider auto expand
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 2 revision(s) exists

  Scenario: Revision slider does not automatically expand by default
    Given I am on the diff page
    Then The auto expand button should be visible
    And The auto expand button should be off
    And There should be a RevisionSlider expand button
    And RevisionSlider wrapper should be hidden

  Scenario: Revision slider expands automatically when clicking auto expand
    Given I am on the diff page
    When I click on the auto expand button
    And I wait for the setting to be saved
    Then The auto expand button should be visible
    And The auto expand button should be on
    And RevisionSlider wrapper should be visible
    And The RevisionSlider has loaded

  Scenario: Revision slider expands automatically when auto expand is on
    Given I am on the diff page
    When I click on the auto expand button
    And I wait for the setting to be saved
    And I refresh the page
    Then The auto expand button should be visible
    And The auto expand button should be on
    And RevisionSlider wrapper should be visible
    And The RevisionSlider has loaded

  Scenario: Revision slider does not expand automatically when auto expand is off
    Given I am on the diff page
    When I click on the auto expand button
    And I wait for the setting to be saved
    And I have dismissed the help dialog
    And The help dialog is hidden
    And I click on the auto expand button
    And I wait for the setting to be saved
    And I refresh the page
    Then The auto expand button should be visible
    And The auto expand button should be off
    And RevisionSlider wrapper should be hidden
