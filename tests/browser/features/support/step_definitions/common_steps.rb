Given(/^I am on the "(.*?)" page$/) do |page|
  visit(ArticlePage, using_params: { article_name: page })
end

Given(/^I am on the "(.*?)" diff page$/) do |page|
  visit(ArticlePage, using_params: { article_name: page, query: 'type=revision&diff=' })
end

Given(/^The page "(.+)" has the following edits:$/) do |page, table|
  page = page.gsub(' ', '_')
  table.rows.each { |(text)| api.edit(title: page, text: text) }
end

Given(/^I refresh the page$/) do
  on(ArticlePage) do |page|
    page.refresh
  end
end

Given(/^The RevisionSlider has loaded$/) do
  on(DiffPage).wait_for_slider_to_load
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