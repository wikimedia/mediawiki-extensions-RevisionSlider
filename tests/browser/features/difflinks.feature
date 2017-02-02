@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider diff links
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 4 revision(s) exists

  Scenario: Older edit diff link can be clicked
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I click on the older edit link
    And I wait until the diff has loaded
    Then the lower pointer should be on revision 2
    And the upper pointer should be on revision 3
    And revision 2 should be loaded on the left of the diff
    And revision 3 should be loaded on the right of the diff

  Scenario: Newer edit diff link can be clicked
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I click on the older edit link
    And I wait until the diff has loaded
    And I click on the newer edit link
    And I wait until the diff has loaded
    Then the lower pointer should be on revision 3
    And the upper pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff
