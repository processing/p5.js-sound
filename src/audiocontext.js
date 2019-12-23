'use strict';

global.TONE_SILENCE_VERSION_LOGGING = true;

const INIT_AUDIO_ID = 'p5_init_sound';
let shouldInitSound = false;
let firstP5Context = null;

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

  const userStartAudio = function(elements, callback) {
    shouldInitSound = true;

    let elt = elements;
    if (elements instanceof p5.Element) {
      elt = elements.elt;
    } else if (elements instanceof Array && elements[0] instanceof p5.Element ) {
      elt = elements.map(function(e) { return e.elt; });
    }

    // user defined an element
    if (elt) {
      return StartAudioContext(audiocontext, elt, callback);
    } else if (firstP5Context && firstP5Context._userNode) {
      // create an initSound button on the first p5 context we found
      createInitSoundButton(firstP5Context);
      return StartAudioContext(audiocontext, firstP5Context._userNode, callback);
    } else {
      // Unknown element — fallback to the page body
      return StartAudioContext(audiocontext, 'body', callback);
    }
  };

  p5.prototype.registerMethod('init', function() {
    // if no element is specified,
    // we will add the 🔊 button to the first p5 sketch we find.
    if (!firstP5Context) {
      firstP5Context = this;
    }

    // set timeout to allow for `p5.initSound()` to be called first
    setTimeout(() => {
      if (!shouldInitSound) { return; }

      // ensure that a preload function exists so that p5 will wait for preloads to finish
      if (!this.preload && !window.preload) {
        this.preload = function() {};
      }

      this._incrementPreload();
      audiocontext.resume()
        .then(() => this._decrementPreload())
        .catch(e => console.error('unable to start audio context', e));
    }, 0);
  });

  p5.prototype.userStartAudio = (elements, callback) => {
    console.warn('userStartAudio() is deprecated in favor of p5.initSound()');
    return userStartAudio(elements, callback);
  };

  /**
   *  <p>It is a good practice to give users control over starting audio playback.
   *  This practice is enforced by Google Chrome's autoplay policy
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, and other browsers.
   *  </p>
   *
   *  <p>
   *  p5.initSound() starts the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
   *  target="_blank" title="Audio Context @ MDN">Audio Context</a> on a user gesture. It utilizes
   *  the <a href="https://github.com/tambien/StartAudioContext">StartAudioContext</a> library by
   *  Yotam Mann (MIT Licence, 2016). Read more at https://github.com/tambien/StartAudioContext.
   *  </p>
   *
   *  <p>Starting the audio context on a user gesture can be as simple as <code>p5.initSound()</code>
   *  at the top of any sketch that uses audio/sound. By default, it will create a button that
   *  initializes the audio context when pressed.</p>
   *
   *  <p>The button element has the ID "p5_loading" and it can be stylized using CSS.
   *  If an HTML element with that ID already exists on the page, then that element will be used.</p>
   *
   *  <p>When p5.initSound() runs before preload, setup, and draw, it will wait until the
   *  audio context has been initialized before running preload, setup or draw.</p>
   *
   * <p>Optional parameters let you decide on a specific element,
   *  or an array of elements, that will start the audio context.
   *  and/or call a function once the audio context is started.</p>
   *  @param  {Element|Array}   [element(s)] This argument can be an Element,
   *                                Selector String, NodeList, p5.Element,
   *                                jQuery Element, or an Array of any of those.
   *  @param  {Function} [callback] Callback to invoke when the AudioContext has started
   *  @return {Promise}            Returns a Promise which is resolved when
   *                                       the AudioContext state is 'running'
   *  @method p5.initSound
   *  @example
   *  <div><code>
   *  p5.initSound();
   *
   *  // Setup won't run until the context has started
   *  function setup() {
   *    background(0, 255, 0);
   *    var mySynth = new p5.MonoSynth();
   *    mySynth.play('A6');
   *  }
   *  </code></div>
   *  @example
   *  <div><code>
   *  function setup() {
   *    background(255, 0, 0);
   *
   *    var myButton = createButton('click to start audio');
   *    myButton.position(0, 0);
   *
   *    p5.initSound(myButton).then(() => {
   *      var mySynth = new p5.MonoSynth();
   *      mySynth.play('A6');
   *      background(0, 255, 0);
   *      myButton.remove();
   *    });
   */
  p5.initSound = userStartAudio;

  function createInitSoundButton(p5Context) {
    if (document.getElementById(INIT_AUDIO_ID) === null) {
      const sndString = document.characterSet === 'UTF-8'
        ? '🔊'
        : 'Sound';
      const initSoundButton = document.createElement('button');
      initSoundButton.setAttribute('id', INIT_AUDIO_ID);
      initSoundButton.innerText = `Init ${sndString}`;
      initSoundButton.style.position = 'absolute';
      initSoundButton.style.zIndex = '2';
      initSoundButton.style.width = '100px';
      initSoundButton.style.height = '100px';
      initSoundButton.style.top = '0';
      const node = p5Context._userNode || document.body;
      node.appendChild(initSoundButton);

      removeInitSoundButtonOnAudioContextStart(initSoundButton);
    }
  }

  function removeInitSoundButtonOnAudioContextStart(child) {
    audiocontext.resume().then(() => {
      child.remove();
    });
  }

  return audiocontext;
});
