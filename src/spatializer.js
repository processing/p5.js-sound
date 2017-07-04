'use strict'

define(function (require) {

	p5.Panner3D = function(input, output) {
	  var panner3D = ac.createPanner();
	  panner3D.panningModel = 'HRTF';
	  panner3D.distanceModel = 'linear';
	  panner3D.setPosition(0,0,0);
	  input.connect(panner3D);
	  panner3D.connect(output);

	  panner3D.pan = function(xVal, yVal, zVal) {
	    panner3D.setPosition(xVal, yVal, zVal);
	  };

	  return panner3D;
	};




	p5.Panner3D = function() {
	Effect.call(this);
		this.spatialPanner = this.ac.createSpatialPanner(); 
    this.input.connect(this.spatialPanner);
    this.spatialPanner.connect(this.output);
	};

  p5.Panner3D.prototype = Object.create(Effect.prototype);

  p5.Panner3D.prototype.


  // =======================================================================
  //                          *** p5.Listener3D ***
  // =======================================================================

  p5.Listener3D = function() {
    Effect.call(this);
    this.spatialListener = this.ac.createSpatialListener();
    this.input.connect(this.spatialListener);
    this.spatialListener.connect(this.output); 
  };
  p5.Listener3D.prototype = Object.create(Effect.prototype);
});