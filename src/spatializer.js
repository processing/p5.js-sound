'use strict'

define(function (require) {
  var p5sound = require('master');
  var Effect = require('effect');

  /**
   * Spatializer is a class that can construct both a Spatial Panner
   * and a Spatial Listener. The panner is based on the 
   * Web Audio Spatial Panner Node
   * https://www.w3.org/TR/webaudio/#the-spatializernode-interface
   * This panner is a spatial processing node that allows audio to be positioned
   * and oriented in 3D space. 
   *
   * The Listener modifies the properties of the Audio Context Listener. 
   * Both objects types use the same methods. The default is a spatial panner.
   *
   * <code>p5.Panner3D</code> - Constructs a Spatial Panner<br/>
   * <code>p5.Listener3D</code> - Constructs a Spatial Listener<br/>
   *
   * @class Spatializer
   * @constructor
   * @return {Object} p5.Spatializer Object
   *
   * @param {Web Audio Node} spatializer Web Audio Spatial Panning Node
   * @param {AudioParam} spatializer.panningModel "equal power" or "HRTF"
   * @param {AudioParam} spatializer.distanceModel "linear", "inverse", or "exponential"
   * @param {String} [type] [Specify construction of a spatial panner or listener]
   */
	p5.Spatializer = function(type) {

    if (type==="listener") {
      this.spatializer = this.ac.listener;
    } else {
      Effect.call(this);
      this.spatializer = this.ac.createPanner();
      this.spatializer.panningModel = 'HRTF';
      this.spatializer.distanceModel = 'linear';
      this.spatializer.connect(this.output);
      this.input.connect(this.spatializer);
    } 
	};
  p5.Spatializer.prototype = Object.create(Effect.prototype);

  /**
   * Connect an audio sorce
   * @param  {Object} src Input source
   */
  p5.Spatializer.prototype.process = function(src) {
    src.connect(this.input);
  }
  /**
   * Set the X,Y,Z position of the Panner
   * @param  {[Number]} xVal
   * @param  {[Number]} yVal
   * @param  {[Number]} zVal
   * @param  {[Number]} time
   * @return {[Array]}      [Updated x, y, z values as an array]
   */
  p5.Spatializer.prototype.position = function(xVal, yVal, zVal, time) {
    this.positionX(xVal,time);
    this.positionY(yVal,time);
    this.positionZ(zVal,time);
    return [this.spatializer.positionX.value, 
              this.spatializer.positionY.value,
              this.spatializer.positionZ.value];
  };

  /**
   * Getter and setter methods for position coordinates
   * @return {Number}      [updated coordinate value]
   */
  p5.Spatializer.prototype.positionX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.spatializer.positionX.value = xVal;
      this.spatializer.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.spatializer.positionX);
    }
    return this.spatializer.positionX.value;
  };
  p5.Spatializer.prototype.positionY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.spatializer.positionY.value = yVal;
      this.spatializer.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connec(this.spatializer.positionY);
    }
    return this.spatializer.positionY.value;
  };
  p5.Spatializer.prototype.positionZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.spatializer.positionZ.value = zVal;
      this.spatializer.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connec(this.spatializer.positionZ);
    }
    return this.spatializer.positionZ.value;
  };

  p5.Spatializer.prototype.orient = function(xVal, yVal, zVal, time) {
  this.orientationX(xVal,time);
  this.orientationY(yVal,time);
  this.orientationZ(zVal,time);
  return [this.spatializer.orientationX.value, 
          this.spatializer.orientationY.value,
          this.spatializer.orientationZ.value];
  };

  /**
   * Getter and setter methods for orient coordinates
   * @return {Number}      [updated coordinate value]
   */
  p5.Spatializer.prototype.orientX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.spatializer.orientX.value = xVal;
      this.spatializer.orientX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.orientX.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connec(this.spatializer.orientX);
    }
    return this.spatializer.orientX.value;
  };
  p5.Spatializer.prototype.orientY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.spatializer.orientY.value = yVal;
      this.spatializer.orientY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.orientY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connec(this.spatializer.orientY);
    }
    return this.spatializer.orientY.value;
  };
  p5.Spatializer.prototype.orientZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.spatializer.orientZ.value = zVal;
      this.spatializer.orientZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.spatializer.orientZ.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connec(this.spatializer.orientY);
    }
    return this.spatializer.orientZ.value;
  };

  p5.Panner3D = function() {
    p5.Spatializer.call(this,'panner');
  };
  p5.Panner3D.prototype = Object.create(p5.Spatializer.prototype);

  p5.Listener3D = function() {
    p5.Spatializer.call(this, 'listener');
  };
  p5.Listener3D.prototype = Object.create(p5.Spatializer.prototype);

  
  return p5.Spatializer;

});