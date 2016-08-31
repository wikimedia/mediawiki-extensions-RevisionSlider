class DiffPage
  include PageObject

  p(:revisionslider_placeholder, css: '.mw-revslider-placeholder')
  div(:revisionslider_wrapper, css: '.mw-revslider-slider-wrapper')
  div(:revisionslider_auto_expand_button, css: '.mw-revslider-auto-expand-button')
  div(:revisionslider_toggle_button, css: '.mw-revslider-toggle-button')
  table(:revisionslider_loading, css: '.mw-revslider-diff-loading')

  div(:revisionslider_help_dialog, css: '.revisionslider-help-dialog')
  button(:revisionslider_help, css: '.mw-revision-slider-container > button')
  a(:revisionslider_help_next, css: '.revisionslider-help-next > a')
  a(:revisionslider_help_previous, css: '.revisionslider-help-previous > a')
  a(:revisionslider_help_close_start, css: '.revisionslider-help-close-start > a')
  a(:revisionslider_help_close_end, css: '.revisionslider-help-close-end > a')

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
    element('div', css: '.mw-revslider-revision-tooltip-' + index.to_s)

  end

  def wait_for_slider_to_load
    wait_until do
      !revisionslider_placeholder?
    end
  end

  def wait_for_ajax_calls
    sleep_period = 0.25
    max_timeout_seconds = 2
    timeout_loops = (max_timeout_seconds / sleep_period).to_i

    while execute_script('return jQuery.active') != 0 && timeout_loops > 0
      sleep(sleep_period)
      timeout_loops -= 1
    end
    true
  end

  def wait_for_diff_to_load
    wait_until do
      !revisionslider_loading?
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