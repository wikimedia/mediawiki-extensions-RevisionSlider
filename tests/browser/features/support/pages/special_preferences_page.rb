class SpecialPreferencesPage
  include PageObject
  page_url 'Special:Preferences'

  link(:beta_features_tab, css: '#preftab-betafeatures')
  checkbox(:revisionslider_checkbox, name: 'wprevisionslider')
  div(:revisionslider_checkbox_div, xpath: '//*[@name="wprevisionslider"]//parent::div')
  button(:submit_button, css: '#prefcontrol')

  def enable_revisionslider
    beta_features_tab_element.when_visible.click
    return if revisionslider_checkbox_checked?
    revisionslider_checkbox_div_element.click
    submit_button_element.when_visible.click
  end

  def disable_revisionslider
    beta_features_tab_element.when_visible.click
    return unless revisionslider_checkbox_checked?
    revisionslider_checkbox_div_element.click
    submit_button_element.when_visible.click
  end
end