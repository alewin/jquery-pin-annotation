(function($) {
  var defaults = {
    removeButtonText: 'Remove',
    saveButtonText: 'Save',
    placeholderText: 'Add note',
    image: '',
    openPopUpOnAdd: false,
    closePopUpOnSave: false,
    closeOtherPopups: true,
    onLoadPlugin: function() {},
    onPinRemove: function() {},
    onPinAdded: function() {},
    onPinPopUpOpen: function() {},
    onPinPopUpClose: function() {},
    onPinPopUpSave: function() {},
    onPinPopUpRemove: function() {},
  };

  function PinAnnotation(pinWrap, options) {
    this.settings = $.extend({}, defaults, options);
    this._pinWrap = $(pinWrap)[0];
    this._$pinWrap = $(pinWrap);
    this._pinHammer;
    this._popUpDom = {
      img: $(`<img src="${this.settings.image}" alt="">`)[0],
      btn_save: `<button class="btn save-pin-btn">${this.settings.saveButtonText}</button>`,
      btn_remove: `<button class='btn remove-pin-btn'>${this.settings.removeButtonText}</button>`,
    };

    this.init();
  }

  PinAnnotation.prototype = {
    init: function() {
      console.log('Hello PinAnnotation!');
      const self = this;
      self._pinHammer = new Hammer(self._pinWrap);
      self._pinWrap.append(self._popUpDom.img);
      if ($.isFunction(self.settings.onLoadPlugin)) {
        self.settings.onLoadPlugin.call(self);
      }
      self._clickEvent();
    },
    _clickEvent: function() {
      const self = this;
      self._pinHammer.on('tap', function(e) {
        console.log('targrt ', $(e.target));

        if ($(e.target).is('.pin-popup .remove-pin-btn')) {
          self._removePin($(e.target).closest('.pin'));
          return;
        }

        if ($(e.target).is('.pin-popup, .pin-popup *')) return;

        if ($(e.target).is('.pin')) {
          if ($(e.target).find('.pin-popup').length > 0) {
            self._closePin($(e.target));
            return;
          } else {
            self._openPin($(e.target));
            return;
          }
        }

        var offX, offY;
        offX = Math.round(self._$pinWrap.offset().left);
        offY = Math.round(self._$pinWrap.offset().top);

        var tapX, tapY;
        tapX = e.center.x - offX;
        tapY = e.center.y - offY;

        console.log('TAPX ', tapX);
        console.log('TAPY ', tapY);

        self._addPin(tapX, tapY);
      });
    },
    _closePin: function($pin) {
      console.log('_closePin');
      const self = this;
      if ($.isFunction(this.settings.onPinPopUpClose)) {
        self.settings.onPinPopUpClose.call(self);
      }
      $pin.find('.pin-popup').remove();
    },
    _addPin: function(widthPosX, heigthPosY) {
      console.log('_addPin');
      const self = this;
      const posX = (widthPosX * 100) / self._$pinWrap.width();
      const posY = (heigthPosY * 100) / self._$pinWrap.height();

      $(`<div/>`, { class: 'pin pulse', style: `left:${posX}%; top:${posY}%;`, 'data-annotation': '', 'data-x': posX, 'data-y': posY }).appendTo(self._$pinWrap);

      if (self.settings.openPopUpOnAdd) {
        self._openPin(self._$pinWrap.find('.pin').last());
      }
    },
    _openPin: function($pin) {
      console.log('open pin ', $pin.find('.pin-popup').length);
      const self = this;
      if (this.settings.closeOtherPopups) {
        self._$pinWrap.find('.pin-popup').remove();
      }

      $('<div/>', {
        class: 'pin-popup',
        append: `<textarea placeholder='${self.settings.placeholderText}' class='annotation-text-pin'> ${$pin.data('annotation')} </textarea>${self._popUpDom.btn_save} ${self._popUpDom.btn_remove}`,
      }).appendTo($pin);
      if (!$pin.data('annotation')) {
        $pin.find('.pin-popup textarea').val('');
      }

      // controllo che il popup non superi i margini top right bottom left
      // dimensione totale del modale pinWrap -
      const xmargin = self._$pinWrap.width() - ($pin.offset().left + $('.pin-popup').width());
      const ymargin = self._$pinWrap.height() - ($pin.offset().top + $('.pin-popup').height());

      if (xmargin < 0) {
        $pin.addClass('right');
      }
      if (ymargin < 0) {
        $pin.addClass('bottom');
      }
      if ($.isFunction(self.settings.onPinPopUpOpen)) {
        self.settings.onPinPopUpOpen.call(this);
      }

      $('.pin-popup .save-pin-btn').click({ self }, self._saveHandlar);
    },
    _saveHandlar: function(e) {
      const self = e.data.self;
      const annotationText = $(e.target)
        .prev('.annotation-text-pin')
        .val();
      const pin = e.target.closest('.pin');
      $(pin).data('annotation', annotationText);
      if ($.isFunction(self.settings.onPinPopUpSave)) {
        self.settings.onPinPopUpSave.call(this);
      }
      if (self.settings.closePopUpOnSave) {
        self._closePin($(pin));
      }
    },
    _removePin: function($pin) {
      console.log('_removePin($pin)');
      const self = this;
      if ($.isFunction(self.settings.onPinRemove)) {
        self.settings.onPinRemove.call(self);
      }
      $pin.remove();
    },
    loadAnnotation: function(pin) {
      console.log('loadAnnotation(pin)');
      const self = this;
      const { x, y, annotation } = pin;
      $(`<div/>`, { class: 'pin pulse', style: `left:${x}%; top:${y}%;`, 'data-annotation': annotation, 'data-x': x, 'data-y': y }).appendTo(self._$pinWrap);
    },
    loadAnnotations: function(pins) {
      console.log('loadAnnotations(pins)');
      const self = this;
      pins.forEach(pin => {
        self.loadAnnotation(pin);
      });
    },
    getAnnotations: function() {
      console.log('getAnnotations()');
      const self = this;
      const pins = self._$pinWrap.find($('[data-annotation]')).toArray();
      const annotations = pins.map(pin => {
        const x = $(pin).data('x'),
          y = $(pin).data('y'),
          annotation = $(pin).data('annotation');
        return { x, y, annotation };
      });
      return annotations;
    },
    getAnnotation: function(pox, posy) {
      console.log('getAnnotation(pox, posy)');
      const self = this;
      function comparePin(pin) {
        return pin.x == pox && pin.y == posy;
      }
      return self.getAnnotations().find(comparePin);
    },
    deleteAnnotations: function() {
      console.log('deleteAnnotations()');
      const self = this;
      self._$pinWrap.find('.pin').remove();
    },
    deleteAnnotation: function(pox, posy) {
      console.log('deleteAnnotation Annotation!');
    },
  };

  $.fn.pinannotation = function(options) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function() {
      var item = $(this),
        instance = item.data('PinAnnotation');
      if (!instance) {
        // create plugin instance and save it in data
        item.data('PinAnnotation', new PinAnnotation(this, options));
      } else {
        // if instance already created call method
        if (typeof options === 'string') {
          instance[options].apply(instance, args);
        }
      }
    });
  };
})(jQuery);
