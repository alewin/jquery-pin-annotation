(function($) {
  $.fn.pinannotation = function(options) {
    var $pinWrap = $(this);
    var pinHammer;
    var freeze = false;

    var defaults = {
      removeButtonText: 'Remove',
      saveButtonText: 'Save',
      placeholderText: 'Add note',
      image: '',
      openPopUpOnAdd: false,
      closeOtherPopups: true,
      onLoadPlugin: function() {},
      onPinRemove: function() {},
      onPinAdded: function() {},
      onPinPopUpOpen: function() {},
      onPinPopUpClose: function() {},
    };
    var settings = $.extend({}, defaults, options);

    var popUpDom = {
      img: `<img src="${settings.image}" alt="">`,
      btn_save: `<button class="btn">${settings.saveButtonText}</button>`,
      btn_remove: `<button class='btn remove-btn'>${settings.removeButtonText}</button>`,
    };

    if ($.isFunction(settings.onLoadPlugin)) {
      settings.onLoadPlugin.call(this);
    }

    var removePin = function($pin) {
      console.log('remove pin');
      if ($.isFunction(settings.onPinRemove)) {
        settings.onPinRemove.call(this);
      }
      $pin.remove();
    };

    var openPin = function($pin) {
      console.log('open pin ', $pin.find('.pin-popup').length);

      if (settings.closeOtherPopups) {
        $pinWrap.find('.pin-popup').remove();
      }

      $('<div/>', { class: 'pin-popup', append: `<textarea placeholder='${settings.placeholderText}' class='annotation-text-pin'> ${$pin.data('annotation')} </textarea>${popUpDom.btn_save} ${popUpDom.btn_remove}` }).appendTo($pin);
      $pin.find('.pin-popup textarea').val('');

      if ($.isFunction(settings.onPinPopUpOpen)) {
        settings.onPinPopUpOpen.call(this);
      }
    };

    var closePin = function($pin) {
      console.log('close pin ');
      if ($.isFunction(settings.onPinPopUpClose)) {
        settings.onPinPopUpClose.call(this);
      }
      $pin.find('.pin-popup').remove();
    };

    var clickEvent = function() {
      pinHammer.on('tap', function(e) {
        if (freeze) return;

        console.log('targrt ', $(e.target));

        if ($(e.target).is('.pin-popup .remove-btn')) {
          removePin($(e.target).closest('.pin'));
          return;
        }

        if ($(e.target).is('.pin-popup, .pin-popup *')) return;

        if ($(e.target).is('.pin')) {
          if ($(e.target).find('.pin-popup').length > 0) {
            closePin($(e.target));
            return;
          } else {
            openPin($(e.target));
            return;
          }
        }

        var offX, offY;
        offX = Math.round($pinWrap.offset().left);
        offY = Math.round($pinWrap.offset().top);

        var tapX, tapY;
        tapX = e.center.x - offX;
        tapY = e.center.y - offY;

        console.log('TAPX ', tapX);
        console.log('TAPY ', tapY);

        addPin(tapX, tapY);
      });
    };
    var addPin = function(posX, posY) {
      console.log('crea pin');

      posX = (posX * 100) / $pinWrap.width();
      posY = (posY * 100) / $pinWrap.height();

      $(`<div/>`, { class: 'pin', style: 'left:' + posX + '%; top:' + posY + '%;', 'data-annotation': '' }).appendTo($pinWrap);

      if (settings.openPopUpOnAdd) {
        openPin($pinWrap.find('.pin').last());
      }
    };

    pinHammer = new Hammer(this[0]);
    clickEvent();
    return this.append(popUpDom.img);
  };
})(jQuery);
