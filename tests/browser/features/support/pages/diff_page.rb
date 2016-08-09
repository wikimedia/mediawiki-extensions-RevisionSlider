class DiffPage
  include PageObject

  p(:revisionslider_placeholder, id: 'mw-revslider-placeholder')
  div(:revisionslider_container, id: 'mw-revslider-container')
  div(:revisionslider_darkness, id: 'mw-revslider-darkness')

  div(:revisionslider_help_dialog, id: 'revisionslider-help-dialog')
  button(:revisionslider_help, css: '#mw-revision-slider-container > button')
  a(:revisionslider_help_next, css: '#revisionslider-help-next > a')
  a(:revisionslider_help_previous, css: '#revisionslider-help-previous > a')
  a(:revisionslider_help_close_start, css: '#revisionslider-help-close-start > a')
  a(:revisionslider_help_close_end, css: '#revisionslider-help-close-end > a')

  div(:revisionslider_timeline_backwards, css: '.mw-revslider-arrow.mw-revslider-arrow-backwards')
  div(:revisionslider_timeline_forwards, css: '.mw-revslider-arrow.mw-revslider-arrow-forwards')

  div(:revisionslider_pointer_lower, css: '.mw-revslider-pointer-lower')
  div(:revisionslider_pointer_upper, css: '.mw-revslider-pointer-upper')

  div(:revisionslider_left_summary, id: 'mw-diff-otitle3')
  div(:revisionslider_right_summary, id: 'mw-diff-ntitle3')

  def revisionslider_rev(index = 1)
    element('div', css: '.mw-revslider-revision[data-pos="' + index.to_s + '"]')
  end

  def revisionslider_tooltip(index = 1)
    element('div', id: 'mw-revslider-revision-tooltip-' + index.to_s)

  end

  def wait_for_slider_to_load
    wait_until do
      !revisionslider_placeholder?
    end
  end

  def wait_for_darkness_to_leave
    wait_until do
      !revisionslider_darkness?
    end
  end

  def wait_for_tooltip(index = 1)
    wait_until do
      revisionslider_tooltip(index).visible?
    end
  end

  def wait_for_no_tooltip(index = 1)
    wait_until do
      !revisionslider_tooltip(index).visible?
    end
  end

  def wait_for_help_dialog_to_hide
    wait_until do
      !revisionslider_help_dialog_element.visible?
    end
  end
end