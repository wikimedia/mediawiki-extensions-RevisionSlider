@chrome @en.wikipedia.beta.wmflabs.org @firefox @integration
Feature: RevisionSlider tooltips
  Background:
    Given I am logged in
    And I have reset my preferences
    And RevisionSlider is enabled as a beta feature
    And a page with 4 revision(s) exists
    And I am on the diff page
    And I click on the expand button
    And The RevisionSlider has loaded
    And I have closed the help dialog at the start

  Scenario: RevisionSlider revision tooltip appears on hover
    Given I hover over revision 1
    Then a tooltip should be present for revision 1
    Given I hover over revision 2
    Then a tooltip should be present for revision 2
    And no tooltip should be present for revision 1

  Scenario: RevisionSlider revision tooltip appears and remains on hover
    Given I hover over revision 1
    Then a tooltip should be present for revision 1
    Given I hover over the revision 1 tooltip
    Then a tooltip should be present for revision 1
    Given I hover over revision 2
    Then a tooltip should be present for revision 2
    And no tooltip should be present for revision 1