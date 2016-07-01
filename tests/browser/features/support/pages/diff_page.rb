class DiffPage
  include PageObject

  p(:revisionslider_placeholder, id: 'mw-revslider-placeholder')
  div(:revisionslider_container, id: 'mw-revslider-container')

  def wait_for_slider_to_load
    wait_until do
      revisionslider_placeholder? == false
    end
  end

end
