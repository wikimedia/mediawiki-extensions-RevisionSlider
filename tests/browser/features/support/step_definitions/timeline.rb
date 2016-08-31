Then(/^The forward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_element.class_name).to match 'oo-ui-widget-disabled'
  end

Then(/^The backward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_element.class_name).to match 'oo-ui-widget-disabled'
end

Then(/^The forward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_element.class_name).not_to match 'oo-ui-widget-disabled'
end

Then(/^The backward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_element.class_name).not_to match 'oo-ui-widget-disabled'
end

Given(/^I click on the forward arrow$/) do
  on(DiffPage).revisionslider_timeline_forwards_element.when_visible.click
end

Given(/^I click on the backward arrow$/) do
  on(DiffPage).revisionslider_timeline_backwards_element.when_visible.click
end