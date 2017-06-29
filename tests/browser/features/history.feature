@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider history
  Background:
    Given a page with 4 revision(s) exists

#  Deactivated until bar clicking will be reintroduced see T165831
#
#  Scenario: RevisionSlider history can be accessed using browser back and forward buttons after clicking on a revision
#    Given I am on the diff page
#    When I have loaded the RevisionSlider and dismissed the help dialog
#    And I click on revision 1 to move the lower pointer
#    And I wait until the diff has loaded
#    And I click on revision 2 to move the upper pointer
#    And I wait until the diff has loaded
#    And I click the browser back button
#    And I wait until the diff has loaded
#    And I click the browser back button
#    And I wait until the diff has loaded
#    And I click the browser forward button
#    And I wait until the diff has loaded
#    Then the lower pointer should be on revision 1
#    And the upper pointer should be on revision 4
#    And revision 1 should be loaded on the left of the diff
#    And revision 4 should be loaded on the right of the diff

  Scenario: RevisionSlider history can be accessed using browser back and forward buttons after dragging to a revision
    Given I am on the diff page
    When I have loaded the RevisionSlider and dismissed the help dialog
    And I drag the lower pointer to revision 1
    And I wait until the diff has loaded
    And I drag the upper pointer to revision 2
    And I wait until the diff has loaded
    And I click the browser back button
    And I wait until the diff has loaded
    And I click the browser back button
    And I wait until the diff has loaded
    And I click the browser forward button
    And I wait until the diff has loaded
    Then the lower pointer should be on revision 1
    And the upper pointer should be on revision 4
    And revision 1 should be loaded on the left of the diff
    And revision 4 should be loaded on the right of the diff
