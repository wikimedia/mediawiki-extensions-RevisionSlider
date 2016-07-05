@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider history
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 4 revision(s) exists
    And I am on the diff page
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start
    And The help dialog is hidden
    And I click on revision 1
    And the darkness has faded

  Scenario: RevisionSlider history can be accessed using browser back and forward buttons
    Given I click the browser back button
    And the darkness has faded
    Then the lower pointer should be on revision 3
    And the lower pointer should be on revision 4
    And revision 3 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff
    Given I click the browser forward button
    And the darkness has faded
    Then the lower pointer should be on revision 1
    And the lower pointer should be on revision 4
    And revision 1 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff