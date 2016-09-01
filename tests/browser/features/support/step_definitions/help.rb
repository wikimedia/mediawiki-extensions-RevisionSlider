Given(/^I have closed the help dialog at the start$/) do
  on(DiffPage).revisionslider_help_close_start_element.when_visible.click
  end

Given(/^I have closed the help dialog at the end/) do
  on(DiffPage).revisionslider_help_close_end_element.when_visible.click
end

Given(/^I have moved to the next step$/) do
  on(DiffPage).revisionslider_help_next_element.when_visible.click
end

Given(/^The help dialog is hidden$/) do
  on(DiffPage).wait_for_help_dialog_to_hide
end

Then(/^The help dialog should be visible/) do
  expect(on(DiffPage).revisionslider_help_dialog_element.when_visible).to be_visible
end

Then(/^The help dialog should not be present/) do
  expect(on(DiffPage).revisionslider_help_dialog_element.when_not_visible).not_to be_visible
end