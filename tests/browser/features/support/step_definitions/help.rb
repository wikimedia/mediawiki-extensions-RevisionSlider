Given(/^I have closed the help dialog at the start$/) do
  on(DiffPage).revisionslider_help_close_start_element.click
  end

Given(/^I have closed the help dialog at the end/) do
  on(DiffPage).revisionslider_help_close_end_element.click
end

Given(/^I have moved to the next step$/) do
  on(DiffPage).revisionslider_help_next_element.click
end

Then(/^The help dialog should be visible/) do
  on(DiffPage).revisionslider_help_dialog_element.visible?.should be_truthy
end

Then(/^The help dialog should not be present/) do
  expect{ on(DiffPage).revisionslider_help_dialog }.to raise_error
end