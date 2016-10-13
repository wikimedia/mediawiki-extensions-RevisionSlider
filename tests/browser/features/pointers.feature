@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider pointers
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 5 revision(s) exists

  Scenario: RevisionSlider pointers move when revision bars are clicked
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I click on revision 3 to move the lower pointer
    And I wait until the diff has loaded
    And I click on revision 4 to move the upper pointer
    And I wait until the diff has loaded
    Then the lower pointer should be on revision 3
    And the upper pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider pointers can be dragged
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I drag the lower pointer to revision 3
    And I wait until the diff has loaded
    And I drag the upper pointer to revision 4
    And I wait until the diff has loaded
    Then the lower pointer should be on revision 3
    And the upper pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider pointers switch when crossed over
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I drag the lower pointer to revision 3
    And I wait until the diff has loaded
    And I click on revision 1 to move the upper pointer
    And I wait until the diff has loaded
    And I wait until the pointers stopped moving
    Then the lower pointer should be on revision 1
    And the upper pointer should be on revision 3
    And revision 1 should be loaded on the left of the diff
    And revision 3 should be loaded on the right of the diff
