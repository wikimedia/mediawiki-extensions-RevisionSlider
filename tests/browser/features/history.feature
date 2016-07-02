@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider history
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 4 revision(s) exists
    And I am on the diff page
    And I click on the expand button
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    And The help dialog is hidden

  Scenario: RevisionSlider history can be accessed using browser back and forward buttons after clicking on a revision
    Given I click on revision 1
    And the diff has loaded
    And I click the browser back button
    And the diff has loaded
    Then the lower pointer should be on revision 3
    And the lower pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff
    Given I click the browser forward button
    And the diff has loaded
    Then the lower pointer should be on revision 1
    And the lower pointer should be on revision 4
    And revision 1 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider history can be accessed using browser back and forward buttons after dragging to a revision
    Given I drag the lower pointer to revision 1
    And the diff has loaded
    And I click the browser back button
    And the diff has loaded
    Then the lower pointer should be on revision 3
    And the lower pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff
    Given I click the browser forward button
    And the diff has loaded
    Then the lower pointer should be on revision 1
    And the lower pointer should be on revision 4
    And revision 1 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff