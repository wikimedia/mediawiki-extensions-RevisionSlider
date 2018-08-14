Then(/^The forward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_disabled_element.when_present).to be_present
end

Then(/^The backward arrow should be disabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_disabled_element.when_present).to be_present
end

Then(/^The forward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_forwards_element).to be_present
end

Then(/^The backward arrow should be enabled/) do
  expect(on(DiffPage).revisionslider_timeline_backwards_element).to be_present
end

Given(/^I click on the forward arrow$/) do
  on(DiffPage).revisionslider_timeline_forwards_element.when_present.click
end

Given(/^I click on the backward arrow$/) do
  on(DiffPage).revisionslider_timeline_backwards_element.when_present.click
end
