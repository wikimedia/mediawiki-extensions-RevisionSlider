@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider help
  Background:
    Given I am logged in
    And a page with 2 revision(s) exists
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And I am on the diff page

  Scenario: RevisionSlider tutorial is present on first load only
    Given The RevisionSlider has loaded
    Then The help dialog should be visible
    When I have closed the help dialog at the start
    And I refresh the page
    And The RevisionSlider has loaded
    Then The help dialog should not be present

  Scenario: RevisionSlider tutorial sequence works
    Given The RevisionSlider has loaded
    Then The help dialog should be visible
    When I have moved to the next step
    And I have moved to the next step
    And I have moved to the next step
    And I have closed the help dialog at the end
    And I refresh the page
    And The RevisionSlider has loaded
    Then The help dialog should not be present