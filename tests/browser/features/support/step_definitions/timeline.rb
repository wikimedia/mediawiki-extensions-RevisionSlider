Then(/^The forward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_element.class_name).to match 'mw-revslider-arrow-disabled'
  end

Then(/^The backward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_element.class_name).to match 'mw-revslider-arrow-disabled'
end

Then(/^The forward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_element.class_name).not_to match 'mw-revslider-arrow-disabled'
end

Then(/^The backward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_element.class_name).not_to match 'mw-revslider-arrow-disabled'
end

Given(/^I click on the forward arrow$/) do
  on(DiffPage).revisionslider_timeline_forwards_element.click
end

Given(/^I click on the backward arrow$/) do
  on(DiffPage).revisionslider_timeline_backwards_element.click
end