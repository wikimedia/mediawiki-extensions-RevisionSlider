Given(/^I am on the page$/) do
  visit(ArticlePage, using_params: { article_name: "RevisionSlider-#{@random_string}" })
end

Given(/^I am on the diff page$/) do
  visit(ArticlePage, using_params: { article_name: "RevisionSlider-#{@random_string}", query: 'type=revision&diff=' })
end

Given(/^a page with (\d+) revision\(s\) exists$/) do |number_of_revisions|
  (1..number_of_revisions.to_i).each do |i|
    api.edit(title: "RevisionSlider-#{@random_string}", text: "RS-Text-#{i}", summary: "RS-Summary-#{i}")
  end
end

Given(/^I refresh the page$/) do
  on(ArticlePage) do |page|
    page.refresh
  end
end

When(/^I click the browser back button$/) do
  on(ArticlePage).back
end

When(/^I click the browser forward button$/) do
  on(ArticlePage).forward
end

Given(/^The RevisionSlider has loaded$/) do
  on(DiffPage).wait_for_slider_to_load
end

Given(/^The window size is (\d+) by (\d+)$/) do |width,height|
  browser.window.resize_to(width.to_i, height.to_i)
end

Then(/^RevisionSlider is enabled as a beta feature$/) do
  visit(SpecialPreferencesPage).enable_revisionslider
end

Then(/^RevisionSlider is disabled as a beta feature$/) do
  visit(SpecialPreferencesPage).disable_revisionslider
end

Then(/^There should be a RevisionSlider container/) do
  expect{ on(DiffPage).revisionslider_container }.not_to raise_error
end

Then(/^There should not be a RevisionSlider placeholder$/) do
  expect{ on(DiffPage).revisionslider_placeholder }.to raise_error
end