define(function (require) {

  'use strict';

  var p5sound = require('master');

  p5.Panner = function(input, output) {
    var panner = p5sound.audiocontext.createPanner();
    panner.panningModel = 'equalpower';
    panner.distanceModel = 'linear';
    panner.setPosition(0,0,0);
    input.connect(panner);
    panner.connect(output);

    panner.pan = function(pval) {
      pval = pval * 90.0;
      var xDeg = parseInt(pval);
      var zDeg = xDeg + 90;
      if (zDeg > 90) {
        zDeg = 180 - zDeg;
      }
      var x = Math.sin(xDeg * (Math.PI / 180));
      var z = Math.sin(zDeg * (Math.PI / 180));
      panner.setPosition(x, 0, z);
    }

    return panner;
  };

});