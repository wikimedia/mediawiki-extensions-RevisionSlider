When(/^I am on the diff page and disabled the help dialog$/) do
  step 'I am on the diff page'
  browser.execute_script('document.cookie = "mw-revslider-hide-help-dialogue=1; path=/";')
  browser.execute_script('localStorage.setItem( "mw-revslider-hide-help-dialogue", "1" );')
end

When(/^I have closed the help dialog at the start$/) do
  on(DiffPage).revisionslider_help_close_start_element.when_present.click
  step 'I wait until help dialog is hidden'
end

When(/^I have closed the help dialog at the end/) do
  on(DiffPage).revisionslider_help_close_end_element.when_present.click
end

When(/^I have moved to the next step$/) do
  on(DiffPage).revisionslider_help_next_element.when_present.click
end

When(/^I wait until help dialog is hidden$/) do
  step 'The help dialog is hidden'
end

Given(/^The help dialog is hidden$/) do
  on(DiffPage).wait_for_help_dialog_to_hide
end

Then(/^The help dialog should be visible/) do
  expect(on(DiffPage).revisionslider_help_dialog_element.when_present).to be_present
end

Then(/^The help dialog should not be present/) do
  expect(on(DiffPage).revisionslider_help_dialog_element.when_not_present).not_to be_present
end
