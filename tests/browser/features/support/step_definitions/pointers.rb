Given(/^I click on revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_rev(index.to_i).when_visible.click
end

Given(/^I drag the lower pointer to revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_pointer_lower_element.element.drag_and_drop_on on(DiffPage).revisionslider_rev(index.to_i).element
end

Given(/^I drag the upper pointer to revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_pointer_upper_element.element.drag_and_drop_on on(DiffPage).revisionslider_rev(index.to_i).element
end

Given(/^the diff has loaded$/) do
  on(DiffPage).wait_for_diff_to_load
end

Then(/^revision (\d+) should be loaded on the left of the diff$/) do |index|
  on(DiffPage).revisionslider_left_summary_element.text.include? "RS-Summary-" + index.to_s
end

Then(/^revision (\d+) should be loaded on the right of the diff$/) do |index|
  on(DiffPage).revisionslider_right_summary_element.text.include? "RS-Summary-" + index.to_s
end

Then(/^the upper pointer should be on revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_pointer_upper_element.style('left') == ( index.to_i - 1 ) * 16
end

Then(/^the lower pointer should be on revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_pointer_lower_element.style('left') == ( index.to_i - 1 ) * 16
end