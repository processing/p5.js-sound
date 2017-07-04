'use strict'

define(function (require){
  var p5sound = require('master');
  var Effect = require('effect');

	p5.Listener3D = function() {
	  //Effect.call(this);
	  this.spatialListener = this.ac.listener;
	  //this.input.connect(this.spatialListener);
	  //this.spatialListener.connect(this.output); 
	};
	p5.Listener3D.prototype = Object.create(Effect.prototype);	

  p5.Listener3D.prototype.position = function(xVal, yVal, zVal, timel) {
    var t = time || 0;
    if (typeof xVal == 'number' &&
      typeof yVal === 'number' &&
      typeof zVal === 'number') {
      this.spatialListener.setPosition(xVal, yVal, zVal);
      this.spatialListener.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.positionX.exponentialRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
      this.spatialListener.positionY.exponentialRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
      this.spatialListener.positionZ.exponentialRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal && yVal && zVal){
      xVal.connect(this.spatialListener.positionX);
      yVal.connect(this.spatialListener.positionY);
      zVal.connect(this.spatialListener.positionZ);
    } return [this.spatialListener.positionX.value, 
              this.spatialListener.positionY.value,
              this.spatialListener.positionZ.value];
  };

  p5.Listener3D.prototype.orient = function(xVal, yVal, zVal, time) {
    var t = time || 0;
    if (typeof xVal == 'number' &&
      typeof yVal === 'number' &&
      typeof zVal === 'number') {
      this.spatialListener.setOrientation(xVal, yVal, zVal);
      this.spatialListener.forwardX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.forwardY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.forwardZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatialListener.forwardX.exponentialRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
      this.spatialListener.forwardY.exponentialRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
      this.spatialListener.forwardZ.exponentialRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal && yVal && zVal){
      xVal.connect(this.spatialListener.forwardX);
      yVal.connect(this.spatialListener.forwardY);
      zVal.connect(this.spatialListener.forwardZ);
    } return [this.spatialListener.forwardX.value, 
              this.spatialListener.forwardY.value,
              this.spatialListener.forwardZ.value];
  };

  return p5.Listener3D;	
});