class DiffPage
  include PageObject

  p(:revisionslider_placeholder, id: 'mw-revslider-placeholder')
  div(:revisionslider_container, id: 'mw-revslider-container')

  div(:revisionslider_help_dialog, id: 'revisionslider-help-dialog')
  button(:revisionslider_help, css: '#mw-revision-slider-container > button')
  a(:revisionslider_help_next, css: '#revisionslider-help-next > a')
  a(:revisionslider_help_previous, css: '#revisionslider-help-previous > a')
  a(:revisionslider_help_close_start, css: '#revisionslider-help-close-start > a')
  a(:revisionslider_help_close_end, css: '#revisionslider-help-close-end > a')

  a(:revisionslider_timeline_backwards, css: '#mw-revslider-container > div > a.mw-revslider-arrow.mw-revslider-arrow-backwards')
  a(:revisionslider_timeline_forwards, css: '#mw-revslider-container > div > a.mw-revslider-arrow.mw-revslider-arrow-forwards')

  def wait_for_slider_to_load
    wait_until do
      revisionslider_placeholder? == false
    end
  end

  def wait_for_help_dialog_to_hide
    wait_until do
      revisionslider_help_dialog_element.visible? == false
    end
  end
end
