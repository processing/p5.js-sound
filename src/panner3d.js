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
   * @return {Object} p5.Panner3D Object
   *
   * @property {Web Audio Node} spatializer Web Audio Spatial Panning Node
   * @property {AudioParam} spatializer.panningModel "equal power" or "HRTF"
   * @pproperty {AudioParam} spatializer.distanceModel "linear", "inverse", or "exponential"
   */
	p5.Panner3D = function() {
      Effect.call(this);
      this.panner = this.ac.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'linear';
      this.panner.connect(this.output);
      this.input.connect(this.panner);
	};

  p5.Panner3D.prototype = Object.create(Effect.prototype);
 

  /**
   * Connect an audio sorce
   * @param  {Object} src Input source
   */
  p5.Panner3D.prototype.process = function(src) {
    src.connect(this.input);
  }
  /**
   * Set the X,Y,Z position of the Panner
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.set = function(xVal, yVal, zVal, time) {
    this.positionX(xVal,time);
    this.positionY(yVal,time);
    this.positionZ(zVal,time);
    return [this.panner.positionX.value, 
              this.panner.positionY.value,
              this.panner.positionZ.value];
  };

  /**
   * Getter and setter methods for position coordinates
   * @method positionX
   * @method positionY
   * @method positionZ
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.positionX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.positionX.value = xVal;
      this.panner.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.positionX);
    }
    return this.panner.positionX.value;
  };
  p5.Panner3D.prototype.positionY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.positionY.value = yVal;
      this.panner.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.positionY);
    }
    return this.panner.positionY.value;
  };
  p5.Panner3D.prototype.positionZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.positionZ.value = zVal;
      this.panner.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.positionZ);
    }
    return this.panner.positionZ.value;
  };

  /**
   * Set the X,Y,Z position of the Panner
   * @method  orient
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.orient = function(xVal, yVal, zVal, time) {
  this.orientX(xVal,time);
  this.orientY(yVal,time);
  this.orientZ(zVal,time);
  return [this.panner.orientationX.value, 
          this.panner.orientationY.value,
          this.panner.orientationZ.value];
  };

  /**
   * Getter and setter methods for orient coordinates
   * @method positionX
   * @method positionY
   * @method positionZ
   * @return {Number}      [updated coordinate value]
   */
  p5.Panner3D.prototype.orientX = function(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.orientationX.value = xVal;
      this.panner.orientationX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.orientationX);
    }
    return this.panner.orientationX.value;
  };
  p5.Panner3D.prototype.orientY = function(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.orientationY.value = yVal;
      this.panner.orientationY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.orientationY);
    }
    return this.panner.orientationY.value;
  };
  p5.Panner3D.prototype.orientZ = function(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.orientationZ.value = zVal;
      this.panner.orientationZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.orientationZ);
    }
    return this.panner.orientationZ.value;
  };

  /**
   * Set the rolloff factor and max distance
   * @method  setFalloff
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]       
   */
  p5.Panner3D.prototype.setFalloff = function(maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  };
  /**
   * Maxium distance between the source and the listener
   * @method  maxDist
   * @param  {Number} maxDistance 
   * @return {Number} updated value        
   */
  p5.Panner3D.prototype.maxDist = function(maxDistance){
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  };

  /**
   * How quickly the volume is reduced as the source moves away from the listener
   * @method  rollof
   * @param  {Number} rolloffFactor 
   * @return {Number} updated value      
   */
  p5.Panner3D.prototype.rolloff = function(rolloffFactor){
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  };

  p5.Panner3D.dispose = function() {
    Effect.prototype.dispose.apply(this);
    this.panner.disconnect();
    delete this.panner;
  };

  return p5.Panner3D;

});
