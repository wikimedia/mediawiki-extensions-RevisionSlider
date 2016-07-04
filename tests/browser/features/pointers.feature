@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider pointers
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 5 revision(s) exists
    And I am on the diff page
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    And The help dialog is hidden

  Scenario: RevisionSlider pointers move then revision bars are clicked
    Given I click on revision 3
    And the darkness has faded
    Then the lower pointer should be on revision 3
    And revision 3 should be loaded on the left of the diff
    Given I click on revision 4
    And the darkness has faded
    Then the upper pointer should be on revision 4
    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider pointers can be dragged
    Given I drag the lower pointer to revision 3
    And the darkness has faded
    Then the lower pointer should be on revision 3
    And revision 3 should be loaded on the left of the diff
    Given I drag the upper pointer to revision 4
    And the darkness has faded
    Then the upper pointer should be on revision 4
    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider pointers switch when crossed over
    Given I drag the upper pointer to revision 3
    And the darkness has faded
    Then the lower pointer should be on revision 3
    And the upper pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    Given I drag the lower pointer to revision 5
    And the darkness has faded
    Then the upper pointer should be on revision 5
    And revision 5 should be loaded on the right of the diff