Given(/^I hover over revision (\d+)$/) do |index|
  on(DiffPage).revisionslider_rev(index.to_i).hover
  end

Given(/^I hover over the revision (\d+) tooltip$/) do |index|
  on(DiffPage).revisionslider_tooltip(index.to_i).hover
end

Then(/^a tooltip should be present for revision (\d+)$/) do |index|
  on(DiffPage).wait_for_tooltip(index.to_i)
  on(DiffPage).revisionslider_tooltip(index.to_i).visible?.should be_truthy
end

Then(/^no tooltip should be present for revision (\d+)$/) do |index|
  on(DiffPage).wait_for_no_tooltip(index.to_i)
  on(DiffPage).revisionslider_tooltip(index.to_i).visible?.should be_falsey
end