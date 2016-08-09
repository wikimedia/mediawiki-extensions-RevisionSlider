@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider timeline
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature

  Scenario: RevisionSlider timeline arrows to be disabled with 3 revisions
    Given a page with 3 revision(s) exists
    And I am on the diff page
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    Then The backward arrow should be disabled
    And The forward arrow should be disabled

  Scenario: RevisionSlider timeline arrows to be enabled with adequate revisions
    Given a page with 30 revision(s) exists
    And The window size is 800 by 600
    And I am on the diff page
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    And The help dialog is hidden
    Then The backward arrow should be enabled
    And The forward arrow should be disabled
    Given I click on the backward arrow
    Then The backward arrow should be disabled
    And The forward arrow should be enabled
    Given I click on the forward arrow
    Then The backward arrow should be enabled
    And The forward arrow should be disabled