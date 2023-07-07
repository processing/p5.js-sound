import Effect from './effect';

/**
 * Panner3D is based on the <a title="Web Audio Panner docs"  href=
 * "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
 * Web Audio Spatial Panner Node</a>.
 * This panner is a spatial processing node that allows audio to be positioned
 * and oriented in 3D space.
 *
 * The position is relative to an <a title="Web Audio Listener docs" href=
 * "https://developer.mozilla.org/en-US/docs/Web/API/AudioListener">
 * Audio Context Listener</a>, which can be accessed
 * by <code>p5.soundOut.audiocontext.listener</code>
 *
 *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
 *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
 *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
 *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
 *
 * @class p5.Panner3D
 * @extends p5.Effect
 * @constructor
 */

class Panner3D extends Effect {
  constructor() {
    super();
    /**
     *  <a title="Web Audio Panner docs"  href=
     *  "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
     *  Web Audio Spatial Panner Node</a>
     *
     *  Properties include<br>
     * [Panning Model](https://www.w3.org/TR/webaudio/#idl-def-PanningModelType)
     * : "equal power" or "HRTF"<br>
     * [DistanceModel](https://www.w3.org/TR/webaudio/#idl-def-DistanceModelType)
     *  : "linear", "inverse", or "exponential"
     *
     *  @property {AudioNode} panner
     *
     */
    this.panner = this.ac.createPanner();
    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.connect(this.output);
    this.input.connect(this.panner);
  }

  /**
   * Connect an audio source
   *
   * @method  process
   * @for p5.Panner3D
   * @param  {Object} src Input source
   */
  process(src) {
    src.connect(this.input);
  }
  /**
   * Set the X,Y,Z position of the Panner
   * @method set
   * @for p5.Panner3D
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  set(xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.panner.positionX.value,
      this.panner.positionY.value,
      this.panner.positionZ.value,
    ];
  }

  /**
   * Getter and setter methods for position coordinates
   * @method positionX
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionY
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionZ
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  positionX(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.positionX.value = xVal;
      this.panner.positionX.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.positionX.linearRampToValueAtTime(
        xVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (xVal) {
      xVal.connect(this.panner.positionX);
    }
    return this.panner.positionX.value;
  }
  positionY(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.positionY.value = yVal;
      this.panner.positionY.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.positionY.linearRampToValueAtTime(
        yVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (yVal) {
      yVal.connect(this.panner.positionY);
    }
    return this.panner.positionY.value;
  }
  positionZ(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.positionZ.value = zVal;
      this.panner.positionZ.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.positionZ.linearRampToValueAtTime(
        zVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (zVal) {
      zVal.connect(this.panner.positionZ);
    }
    return this.panner.positionZ.value;
  }

  /**
   * Set the X,Y,Z position of the Panner
   * @method  orient
   * @for p5.Panner3D
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  orient(xVal, yVal, zVal, time) {
    this.orientX(xVal, time);
    this.orientY(yVal, time);
    this.orientZ(zVal, time);
    return [
      this.panner.orientationX.value,
      this.panner.orientationY.value,
      this.panner.orientationZ.value,
    ];
  }

  /**
   * Getter and setter methods for orient coordinates
   * @method orientX
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientY
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientZ
   * @for p5.Panner3D
   * @return {Number}      updated coordinate value
   */
  orientX(xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.orientationX.value = xVal;
      this.panner.orientationX.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.orientationX.linearRampToValueAtTime(
        xVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (xVal) {
      xVal.connect(this.panner.orientationX);
    }
    return this.panner.orientationX.value;
  }
  orientY(yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.orientationY.value = yVal;
      this.panner.orientationY.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.orientationY.linearRampToValueAtTime(
        yVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (yVal) {
      yVal.connect(this.panner.orientationY);
    }
    return this.panner.orientationY.value;
  }
  orientZ(zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.orientationZ.value = zVal;
      this.panner.orientationZ.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.panner.orientationZ.linearRampToValueAtTime(
        zVal,
        this.ac.currentTime + 0.02 + t
      );
    } else if (zVal) {
      zVal.connect(this.panner.orientationZ);
    }
    return this.panner.orientationZ.value;
  }

  /**
   * Set the rolloff factor and max distance
   * @method  setFalloff
   * @for p5.Panner3D
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]
   */
  setFalloff(maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  }
  /**
   * Maxium distance between the source and the listener
   * @method  maxDist
   * @for p5.Panner3D
   * @param  {Number} maxDistance
   * @return {Number} updated value
   */
  maxDist(maxDistance) {
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  }

  /**
   * How quickly the volume is reduced as the source moves away from the listener
   * @method  rolloff
   * @for p5.Panner3D
   * @param  {Number} rolloffFactor
   * @return {Number} updated value
   */
  rolloff(rolloffFactor) {
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  }

  dispose() {
    super.dispose();
    if (this.panner) {
      this.panner.disconnect();
      delete this.panner;
    }
  }
}

export default Panner3D;
