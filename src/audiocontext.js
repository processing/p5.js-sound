'use strict';

define(['StartAudioContext'], function (require, StartAudioContext) {
  // Create the Audio Context
  var audiocontext = new window.AudioContext();

  /**
   * <p>Returns the Audio Context for this sketch. Useful for users
   * who would like to dig deeper into the <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * <p>Some browsers require users to startAudioContext
   * with a user gesture, such as touchStarted in the example below.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext for this sketch
   * @example
   * <div><code>
   *  function draw() {
   *    background(255);
   *    textAlign(CENTER);
   *
   *    if (getAudioContext().state !== 'running') {
   *      text('click to start audio', width/2, height/2);
   *    } else {
   *      text('audio is enabled', width/2, height/2);
   *    }
   *  }
   *
   *  function touchStarted() {
   *    if (getAudioContext().state !== 'running') {
   *      getAudioContext().resume();
   *    }
   *    var synth = new p5.MonoSynth();
   *    synth.play('A4', 0.5, 0, 0.2);
   *  }
   *
   * </div></code>
   */
  p5.prototype.getAudioContext = function() {
    return audiocontext;
  };


  /**
   *  <p>It is good practice to wait for a user gesture before starting audio.
   *  This practice is enforced by Google Chrome's autoplay policy as of r70
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, and other browsers.
   *  </p>
   *
   *  <p>
   *  This method starts the audio context on a user gesture. It utilizes
   *  StartAudioContext library by Yotam Mann (MIT Licence, 2016). Read more
   *  at https://github.com/tambien/StartAudioContext.
   *  </p>
   *  @param  {Element|Array}   [element(s)] This argument can be an Element,
   *                                Selector String, NodeList, p5.Element,
   *                                jQuery Element, or an Array of any of those.
   *  @param  {Function} [callback] Callback to invoke when the AudioContext has started
   *  @return {Promise}            Returns a Promise which is resolved when
   *                                       the AudioContext state is 'running'
   * @method userStartAudio
   *  @example
   *  <div><code>
   *  function setup() {
   *    var myButton = createButton('click to start audio');
   *    myButton.position(0, 0);
   *
   *    userStartAudio(myButton, function() {
   *      alert('audio started!');
   *    });
   *  }
   *  </code></div>
   */
  p5.prototype.userStartAudio = function(elements, callback) {
    var elt = elements;
    if (elements instanceof p5.Element) {
      elt = elements.elt;
    } else if (elements instanceof Array && elements[0] instanceof p5.Element ) {
      elt = elements.map(function(e) { return e.elt});
    }
    return StartAudioContext(audiocontext, elt, callback);
  };

  return audiocontext;
});
