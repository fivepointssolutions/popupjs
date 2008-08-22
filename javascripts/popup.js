/*
 *  popup.js
 *
 *  dependencies: prototype.js, effects.js, lowpro.js
 *
 *  --------------------------------------------------------------------------
 *  
 *  Allows you to open up a URL inside of a Facebook-style window. To use
 *  simply assign the class "popup" to a link that contains an href to the
 *  HTML snippet that you would like to load up inside a window:
 *  
 *    <a class="popup" href="window.html">Window</a>
 *
 *  You can also "popup" a specific div by referencing it by ID:
 *
 *    <a class="popup" href="#my_div">Popup</a>
 *    <div id="my_div" style="display:none">Hello World!</div>
 *  
 *  You will need to install the following hook:
 *  
 *    Event.addBehavior({'a.popup': Popup.TriggerBehavior()});
 *
 *  --------------------------------------------------------------------------
 *  
 *  Copyright (c) 2008, John W. Long
 *  Portions copyright (c) 2008, Five Points Solutions, Inc.
 *  
 *  Permission is hereby granted, free of charge, to any person obtaining a
 *  copy of this software and associated documentation files (the "Software"),
 *  to deal in the Software without restriction, including without limitation
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *  and/or sell copies of the Software, and to permit persons to whom the
 *  Software is furnished to do so, subject to the following conditions:
 *  
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 *  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *  DEALINGS IN THE SOFTWARE.
 *  
 */

var Popup = {
  BorderThickness: 8,
  BorderImage: '/images/popup_border_background.png',
  BorderTopLeftImage: '/images/popup_border_top_left.png',
  BorderTopRightImage: '/images/popup_border_top_right.png',
  BorderBottomLeftImage: '/images/popup_border_bottom_left.png',
  BorderBottomRightImage: '/images/popup_border_bottom_right.png'
};

Popup.borderImages = function() {
  return $A([
    Popup.BorderImage,
    Popup.BorderTopLeftImage,
    Popup.BorderTopRightImage,
    Popup.BorderBottomLeftImage,
    Popup.BorderBottomRightImage
  ]);
}

Popup.preloadImages = function() {
  if (!Popup.imagesPreloaded) {
    Popup.borderImages().each(function(src) {
      var image = new Image();
      image.src = src;
    });
    Popup.preloadedImages = true;
  }
}

Popup.TriggerBehavior = Behavior.create({
  initialize: function() {
    var matches = this.element.href.match(/\#(.+)$/);
    if (matches) {
      this.window = new Popup.Window($(matches[1]));
    } else {
     this.window = new Popup.AjaxWindow(this.element.href);
    }
    if (this.element.hasClassName('now')) this.window.show();
  },
  
  onclick: function(event) {
    this.popup();
    event.stop();
  },
  
  popup: function() {
    this.window.show();
  }
});

Popup.AbstractWindow = Class.create({
  initialize: function() {
    Popup.preloadImages();
    this.buildWindow();
  },
  
  buildWindow: function() {
    this.element = new Element('table', {className: 'popup_window', style: 'display: none; position: absolute; border-collapse: collapse; padding: 0px; margin: 0px;'});
    var tbody = new Element('tbody');
    this.element.insert(tbody)
    
    var top_row = $tr();
    top_row.insert($td({style: 'background: url(' + Popup.BorderTopLeftImage + '); height: ' + Popup.BorderThickness + 'px; width: ' + Popup.BorderThickness + 'px; padding: 0px'}));
    top_row.insert($td({style: 'background: url(' + Popup.BorderImage + '); height: ' + Popup.BorderThickness + 'px; padding: 0px'}))
    top_row.insert($td({style: 'background: url(' + Popup.BorderTopRightImage + '); height: ' + Popup.BorderThickness + 'px; width: ' + Popup.BorderThickness + 'px; padding: 0px'}));
    tbody.insert(top_row);
    
    var content_row = $tr();
    content_row.insert($td({style: 'background: url(' + Popup.BorderImage + '); width: ' + Popup.BorderThickness + 'px; padding: 0px'}, ''));
    this.content = $td({style: 'background-color: white; padding: 0px'});
    content_row.insert(this.content);
    content_row.insert($td({style: 'background: url(' + Popup.BorderImage + '); width: ' + Popup.BorderThickness + 'px; padding: 0px'}, ''));
    tbody.insert(content_row);
    
    var bottom_row = $tr();
    bottom_row.insert($td({style: 'background: url(' + Popup.BorderBottomLeftImage + '); height: ' + Popup.BorderThickness + 'px; width: ' + Popup.BorderThickness + 'px; padding: 0px'}));
    bottom_row.insert($td({style: 'background: url(' + Popup.BorderImage + '); height: ' + Popup.BorderThickness + 'px; padding: 0px'}))
    bottom_row.insert($td({style: 'background: url(' + Popup.BorderBottomRightImage + '); height: ' + Popup.BorderThickness + 'px; width: ' + Popup.BorderThickness + 'px; padding: 0px'}));
    tbody.insert(bottom_row);

    var body = $$('body').first();
    body.insert(this.element);
  },
  
  makeDraggable: function() {
    if (!this.draggable)
      this.draggable = new Draggable(this.element.identify(), {handle: 'h3.title', scroll: window});
  },
  
  show: function() {
    this.beforeShow();
    this.element.show();
    this.content.select('*').each(function(element) {
      element.toggleClassName('render');
    });
    this.afterShow();
  },
  
  hide: function() {
    this.element.hide();
    if (this.draggable) {
      this.draggable.destroy();
      this.draggable = null;
    }
  },
  
  toggle: function() {
    if (this.element.visible()) {
      this.hide();
    } else {
      this.show();
    }
  },
  
  focus: function() {
    var form = this.element.down('form');
    if (form) {
      var elements = form.getElements().reject(function(e) { return e.type == 'hidden' });
      var element = elements[0] || form.down('button');
      if (element) element.focus();
    }
  },
  
  beforeShow: function() {
    this.centerWindowInView();
  },
  
  afterShow: function() {
    if (this.element.down('.popup.draggable')) this.makeDraggable();
    this.focus();
  },

  centerWindowInView: function() {
    var offsets = document.viewport.getScrollOffsets();
    this.element.setStyle({
      left: parseInt(offsets.left + (document.viewport.getWidth() - this.element.getWidth()) / 2) + 'px',
      top: parseInt(offsets.top + (document.viewport.getHeight() - this.element.getHeight()) / 2.2) + 'px'
    });
  }
});

Popup.Window = Class.create(Popup.AbstractWindow, {
  initialize: function($super, element, options) {
    $super(options);
    element.remove();
    this.content.update(element);
    element.show();
  }
});

Popup.AjaxWindow = Class.create(Popup.AbstractWindow, {
  initialize: function($super, url, options) {
    $super();
    options = Object.extend({reload: true}, options);
    this.url = url;
    this.reload = options.reload;
  },
  
  show: function($super) {
    if (!this.loaded || this.reload) {
      new Ajax.Updater(this.content, this.url, {asynchronous: false, method: "get", evalScripts: true, onComplete: $super});
      this.loaded = true;
    } else {
      $super();
    }
  }
});

Popup.Alert = Class.create(Popup.AbstractWindow, {
  initialize: function($super, message, options) {
    $super();
    this.options = Object.extend({
      title: 'Alert'
    }, (options || {}));
    this.message = message;
  },
  
  beforeShow: function($super) {
    var titleBar = $h3({'class':'title'}, this.options.title);
    var buttonBar = $div({'class':'buttons'});
    var popup = $div({'class':'popup'},
      titleBar,
      $div({'class':'popup_content'},
        $p(this.message),
        buttonBar
      )
    );
    this.content.insert(popup);
    
    this.okButton = $a({href:'#ok'}, 'OK');
    this.okButton.observe('click', this.close.bindAsEventListener(this));
    buttonBar.insert(this.okButton);
    
    if (this.options.beforeShow) this.options.beforeShow(this);
    $super();
  },
  
  close: function(event) {
    this.element.remove();
    event.stop();
  }
});
Popup.alert = function(message, options) {
  new Popup.Alert(message, options).show();
};

// Element extensions
Element.addMethods({
  closePopup: function(element) {
    $(element).up('table.popup_window').hide();
  }
});