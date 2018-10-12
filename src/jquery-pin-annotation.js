(function($) {
  var defaults = {
    removeButtonText: 'Remove',
    saveButtonText: 'Save',
    placeholderText: 'Add note',
    image: '',
    openPopUpOnAdd: false,
    closePopUpOnSave: false,
    closePopUpEmpty: false,
    closeOtherPopups: true,
    canUploadFiles: false,
    multipleFiles: false,
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
      plugin: this,
      img: $(`<img class="pin-img" src="${this.settings.image}" alt="">`)[0],
      input_files: function(prop) {
        return `<input type="file" ${prop}></input>`;
      },
      textarea: function(prop, text) {
        return `<textarea placeholder='${this.plugin.settings.placeholderText}' class='annotation-text-pin' ${prop}> ${text} </textarea>`;
      },
      btn_save: function(prop) {
        return `<button class="btn save-pin-btn" ${prop}>${this.plugin.settings.saveButtonText}</button>`;
      },
      btn_remove: function(prop) {
        return `<button class='btn remove-pin-btn' ${prop}>${this.plugin.settings.removeButtonText}</button>`;
      },
    };

    this.init();
  }

  PinAnnotation.prototype = {
    init: function() {
      console.log('Hello PinAnnotation!');
      const self = this;
      self._pinWrap.append(self._popUpDom.img);

      self._pinHammer = new Hammer(self._pinWrap);
      self._clickEvent();
      setTimeout(function() {
        self._onResize();
      }, 100);
      $(window).on('resize', function() {
        self._onResize();
      });

      if ($.isFunction(self.settings.onLoadPlugin)) {
        self.settings.onLoadPlugin.call(self);
      }
    },
    _onResize: function() {
      //ßßconsole.log('resize');

      const self = this;
      var $pinWrapParent = self._$pinWrap.parent();
      var $pinImg = $(self._popUpDom.img);

      $pinImg.height($pinWrapParent.height() - 50).width('auto');

      if ($pinImg.width() > $pinWrapParent.width()) $pinImg.width($pinWrapParent.width() - 50).height('auto');
    },
    _clickEvent: function() {
      const self = this;
      self._pinHammer.touchAction.update();
      console.log('click');
      self._pinHammer.on('tap', function(e) {
        //console.log('targrt ', $(e.target));
        self._pinHammer.touchAction.update();
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
        offX = Math.round(self._$pinWrap.find('img').offset().left) + Math.round($(window).scrollLeft());
        offY = Math.round(self._$pinWrap.find('img').offset().top) - Math.round($(window).scrollTop());

        var tapX, tapY;
        tapX = e.center.x - offX;
        tapY = e.center.y - offY;

        self._addPin(tapX, tapY);
      });
    },
    _closePin: function($pin) {
      console.log('_closePin');
      const self = this;
      if ($.isFunction(this.settings.onPinPopUpClose)) {
        self.settings.onPinPopUpClose.call(self);
      }
      const text = $pin
      .find('.annotation-text-pin')
      .val()
      .replace(/\s/g, '');
      $pin.find('.pin-popup').remove();
      if (self.settings.closePopUpEmpty) {
        if (text == undefined || text == '') {
          $pin.remove();
        }
      }
    },
    _addPin: function(widthPosX, heigthPosY) {
      console.log('_addPin');
      const self = this;
      const posX = (widthPosX * 100) / self._$pinWrap.width();
      const posY = (heigthPosY * 100) / self._$pinWrap.height();
      const disabled = false;
      $(`<div/>`, { class: 'pin pulse', style: `left:${posX}%; top:${posY}%;`, 'data-annotation': '', 'data-disabled': disabled, 'data-x': posX, 'data-y': posY }).appendTo(self._$pinWrap);

      if (self.settings.openPopUpOnAdd) {
        self._openPin(self._$pinWrap.find('.pin').last());
      }
    },
    _openPin: function($pin) {
      console.log('open pin ', $pin.find('.pin-popup').length);
      const self = this;
      if (self.settings.closeOtherPopups) {
        self._$pinWrap
          .find('.pin')
          .find('.pin-popup')
          .toArray()
          .forEach(pin => {
            self._closePin($(pin.parentElement));
          });
      }
      const disabledPin = $pin.data('disabled') ? 'disabled' : '';
      // const multipleFiles = self.settings.multipleFiles ? 'multiple' : '';

      $('<div/>', {
        class: 'pin-popup',
        append: `${self._popUpDom.textarea(disabledPin, $pin.data('annotation'))} <br> ${self._popUpDom.input_files(disabledPin)} ${self._popUpDom.btn_save(disabledPin)} ${self._popUpDom.btn_remove(disabledPin)}`,
      }).appendTo($pin);
      if (!$pin.data('annotation')) {
        $pin.find('.pin-popup textarea').val('');
      }

      // controllo che il popup non superi i margini top right bottom left
      // dimensione totale del modale pinWrap -

      //console.log('PPW', $('.pin-popup').css('width'))
      //console.log('PPH', $('.pin-popup').css('height'))

      //const xmargin = self._$pinWrap.width() - ($pin.offset().left + Math.round($(window).scrollLeft()) + parseInt($('.pin-popup').css('width')));
      //const ymargin = self._$pinWrap.height() - ($pin.offset().top - Math.round($(window).scrollTop()) + parseInt($('.pin-popup').css('height')));

      //console.log('PPL ', $pin.position().left - parseInt($('.pin-popup').css('width')))
      //console.log('PWL ', self._$pinWrap.position().left)

      const xmargin = $pin.position().left - parseInt($('.pin-popup').css('width'));
      const ymargin = $pin.position().top - parseInt($('.pin-popup').css('height'));

      //console.log('XM ', xmargin)
      //console.log('YM ', ymargin)

      if (xmargin > 0) {
        $pin.addClass('right');
      }
      if (ymargin > 0) {
        $pin.addClass('bottom');
      }
      if ($.isFunction(self.settings.onPinPopUpOpen)) {
        self.settings.onPinPopUpOpen.call(this);
      }

      $('.pin-popup .save-pin-btn').click({ self }, self._saveHandlar);
    },
    _saveHandlar: function(e) {
      console.log('salva');

      const self = e.data.self;
      const annotationText = $(e.target)
        .parent()
        .find('.annotation-text-pin')
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
      const { x, y, testo, disabled } = pin;
      $(`<div/>`, { class: 'pin pulse', style: `left:${x}%; top:${y}%;`, 'data-annotation': testo, 'data-disabled': disabled, 'data-x': x, 'data-y': y }).appendTo(self._$pinWrap);
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
          disabled = $(pin).data('disabled'),
          testo = $(pin).data('annotation');
        return { x, y, testo, disabled };
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
