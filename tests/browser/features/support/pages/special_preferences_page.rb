class SpecialPreferencesPage
  include PageObject
  page_url 'Special:Preferences'

  a(:beta_features_tab, css: '#preftab-betafeatures')
  text_field(:revisionslider_checkbox, css: '#mw-input-wprevisionslider')
  button(:submit_button, css: '#prefcontrol')

  def enable_revisionslider
    beta_features_tab_element.when_present.click
    return unless revisionslider_checkbox_element.attribute('checked').nil?
    revisionslider_checkbox_element.click
    submit_button_element.when_present.click
  end

  def disable_revisionslider
    beta_features_tab_element.when_present.click
    return if revisionslider_checkbox_element.attribute('checked').nil?
    revisionslider_checkbox_element.click
    submit_button_element.when_present.click
  end
end