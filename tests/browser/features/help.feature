@chrome @en.wikipedia.beta.wmflabs.org @firefox @test2.wikipedia.org @vagrant @integration
Feature: RevisionSlider help
  Background:
    Given I am logged in
    And The page "RevisionSliderTestPage1" has the following edits:
      | RS text        |
      | RS longer text |
      | RS less text   |
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And I am on the "RevisionSliderTestPage1" diff page

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