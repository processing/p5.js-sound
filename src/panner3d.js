'use strict'

define(function (require) {
  var p5sound = require('master');
  var Effect = require('effect');


	p5.Panner3D = function() {
    Effect.call(this);

    this.spatialPanner = this.ac.createSpatialPanner();


 //    this.input.connect(this.spatialPanner);
 //    this.spatialPanner.connect(this.output);
 //    this.spatialPanner.panningModel = 'HRTF';
 //    this.spatialPanner.distanceModel = 'linear';
	};

  p5.Panner3D.prototype = Object.create(Effect.prototype);

  p5.Panner3D.prototype.position = function(xVal, yVal, zVal, time) {
    var t = time || 0;
    if (typeof xVal == 'number' &&
      typeof yVal === 'number' &&
      typeof zVal === 'number') {
      this.spatialPanner.setPosition(xVal, yVal, zVal);
      this.spatialPanner.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.positionX.exponentialRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
      this.spatialPanner.positionY.exponentialRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
      this.spatialPanner.positionZ.exponentialRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal && yVal && zVal){
      xVal.connect(this.spatialPanner.positionX);
      yVal.connect(this.spatialPanner.positionY);
      zVal.connect(this.spatialPanner.positionZ);
    } return [this.spatialPanner.positionX.value, 
              this.spatialPanner.positionY.value,
              this.spatialPanner.positionZ.value];
  };

  p5.Panner3D.prototype.orient = function(xVal, yVal, zVal, time) {
    var t = time || 0;
    if (typeof xVal == 'number' &&
      typeof yVal === 'number' &&
      typeof zVal === 'number') {
      this.spatialPanner.setOrientation(xVal, yVal, zVal);
      this.spatialPanner.orientationX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.orientationY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.orientationZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialPanner.orientationX.exponentialRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
      this.spatialPanner.orientationY.exponentialRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
      this.spatialPanner.orientationZ.exponentialRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal && yVal && zVal){
      xVal.connect(this.spatialPanner.orientationX);
      yVal.connect(this.spatialPanner.orientationY);
      zVal.connect(this.spatialPanner.orientationZ);
    } return [this.spatialPanner.orientationX.value, 
              this.spatialPanner.orientationY.value,
              this.spatialPanner.orientationZ.value];
  };

  return p5.Panner3D;


  // =======================================================================
  //                          *** p5.Listener3D ***
  // =======================================================================

 
});