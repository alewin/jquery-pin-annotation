(function($) {
  $.fn.pinannotation = function(options) {
    var $pinWrap = $(this);
    var pinHammer;
    var freeze = false;

    var defaults = {
      removeButtonText: 'Remove',
      saveButtonText: 'Save',
      placeholderText: 'Add note',
      defaultAnnotationValue: '',
      image: '',
      onLoadPlugin: function() {},
      onPinRemove: function() {},
      onPinAdded: function() {}
    };
    var settings = $.extend({}, defaults, options);
    var imgHtml = `<img src="${settings.image}" alt="">`;

    if ($.isFunction(settings.onLoadPlugin)) {
      console.log($(this).id);
      settings.onLoadPlugin.call(this);
    }

    var removePin = function($pin) {
      console.log('remove pin');
      $pin.remove();
    };

    var openPin = function($pin) {
      console.log('open pin ', $pin.find('.pin-popup').length);

      if ($pin.find('.pin-popup').length > 0) return;

      $('<div/>', {
        class: 'pin-popup',
        append: `<textarea class='annotation-text-pin'> ${$pin.data(
          'annotation'
        )} </textarea><button class='btn'>${
          settings.saveButtonText
        }</button><button class='btn remove-btn'>${
          settings.removeButtonText
        }</button>`
      }).appendTo($pin);
    };

    var closePin = function($pin) {
      console.log('close pin ');

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

      $(`<div/>`, {
        class: 'pin',
        style: 'left:' + posX + '%; top:' + posY + '%;',
        'data-annotation': settings.defaultAnnotationValue,
        placeholder: settings.placeholderText
      }).appendTo($pinWrap);
      openPin($pinWrap);
    };

    pinHammer = new Hammer(this[0]);
    clickEvent();
    return this.append(imgHtml);
  };
})(jQuery);
