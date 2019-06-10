'use strict';

global.TONE_SILENCE_VERSION_LOGGING = true;

define(['startaudiocontext', 'Tone/core/Context', 'Tone/core/Tone'], function (StartAudioContext, Context, Tone) {
  // Create the Audio Context
  const audiocontext = new window.AudioContext();

  // Tone and p5.sound share the same audio context
  Tone.context.dispose();
  Tone.setContext(audiocontext);

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
   *  <p>It is a good practice to give users control over starting audio playback.
   *  This practice is enforced by Google Chrome's autoplay policy as of r70
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, and other browsers.
   *  </p>
   *
   *  <p>
   *  userStartAudio() starts the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
   *  target="_blank" title="Audio Context @ MDN">Audio Context</a> on a user gesture. It utilizes
   *  the <a href="https://github.com/tambien/StartAudioContext">StartAudioContext</a> library by
   *  Yotam Mann (MIT Licence, 2016). Read more at https://github.com/tambien/StartAudioContext.
   *  </p>
   *
   *  <p>Starting the audio context on a user gesture can be as simple as <code>userStartAudio()</code>.
   *  Optional parameters let you decide on a specific element that will start the audio context,
   *  and/or call a function once the audio context is started.</p>
   *  @param  {Element|Array}   [element(s)] This argument can be an Element,
   *                                Selector String, NodeList, p5.Element,
   *                                jQuery Element, or an Array of any of those.
   *  @param  {Function} [callback] Callback to invoke when the AudioContext has started
   *  @return {Promise}            Returns a Promise which is resolved when
   *                                       the AudioContext state is 'running'
   *  @method userStartAudio
   *  @for p5
   *  @example
   *  <div><code>
   *  function setup() {
   *    var myDiv = createDiv('click to start audio');
   *    myDiv.position(0, 0);
   *
   *    var mySynth = new p5.MonoSynth();
   *
   *    // This won't play until the context has started
   *    mySynth.play('A6');
   *
   *    // Start the audio context on a click/touch event
   *    userStartAudio().then(function() {
   *       myDiv.remove();
   *     });
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
