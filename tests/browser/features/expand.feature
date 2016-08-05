@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider expand
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 2 revision(s) exists

  Scenario: RevisionSlider is collapsed initially
    Given I am on the diff page
    Then  There should be a RevisionSlider expand button
    And RevisionSlider wrapper should be hidden

  Scenario: RevisionSlider loads after expanding
    Given I am on the diff page
    And I click on the expand button
    Then RevisionSlider wrapper should be visible
    And The RevisionSlider has loaded

  Scenario: RevisionSlider hides after collapsing
    Given I am on the diff page
    And I click on the expand button
    Then RevisionSlider wrapper should be visible
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    And The help dialog is hidden
    Given I click on the expand button
    Then RevisionSlider wrapper should be hidden
