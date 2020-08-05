global.TONE_SILENCE_VERSION_LOGGING = true;

import StartAudioContext from 'startaudiocontext';
import Tone from 'Tone/core/Tone';
import 'Tone/core/Context';

// Create the Audio Context
const audiocontext = new window.AudioContext();

// Tone and p5.sound share the same audio context
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
 * @for p5
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
export function getAudioContext() {
  return audiocontext;
}

/**
 *  <p>It is not only a good practice to give users control over starting
 *  audio. This policy is enforced by many web browsers, including iOS and
 *  <a href="https://goo.gl/7K7WLu" title="Google Chrome's autoplay
 *  policy">Google Chrome</a>, which create the Web Audio API's
 *  <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
 *  title="Audio Context @ MDN">Audio Context</a>
 *  in a suspended state.</p>
 *
 *  <p>In these browser-specific policies, sound will not play until a user
 *  interaction event (i.e. <code>mousePressed()</code>) explicitly resumes
 *  the AudioContext, or starts an audio node. This can be accomplished by
 *  calling <code>start()</code> on a <code>p5.Oscillator</code>,
 *  <code> play()</code> on a <code>p5.SoundFile</code>, or simply
 *  <code>userStartAudio()</code>.</p>
 *
 *  <p><code>userStartAudio()</code> starts the AudioContext on a user
 *  gesture. The default behavior will enable audio on any
 *  mouseUp or touchEnd event. It can also be placed in a specific
 *  interaction function, such as <code>mousePressed()</code> as in the
 *  example below. This method utilizes
 *  <a href="https://github.com/tambien/StartAudioContext">StartAudioContext
 *  </a>, a library by Yotam Mann (MIT Licence, 2016).</p>
 *  @param  {Element|Array}   [element(s)] This argument can be an Element,
 *                                Selector String, NodeList, p5.Element,
 *                                jQuery Element, or an Array of any of those.
 *  @param  {Function} [callback] Callback to invoke when the AudioContext
 *                                has started
 *  @return {Promise}            Returns a Promise that resolves when
 *                                       the AudioContext state is 'running'
 *  @method userStartAudio
 *  @for p5
 *  @example
 *  <div><code>
 *  function setup() {
 *    // mimics the autoplay policy
 *    getAudioContext().suspend();
 *
 *    let mySynth = new p5.MonoSynth();
 *
 *    // This won't play until the context has resumed
 *    mySynth.play('A6');
 *  }
 *  function draw() {
 *    background(220);
 *    textAlign(CENTER, CENTER);
 *    text(getAudioContext().state, width/2, height/2);
 *  }
 *  function mousePressed() {
 *    userStartAudio();
 *  }
 *  </code></div>
 */
export function userStartAudio(elements, callback) {
  var elt = elements;
  if (elements instanceof p5.Element) {
    elt = elements.elt;
  } else if (elements instanceof Array && elements[0] instanceof p5.Element) {
    elt = elements.map(function (e) {
      return e.elt;
    });
  }
  return StartAudioContext(audiocontext, elt, callback);
}

export default audiocontext;
