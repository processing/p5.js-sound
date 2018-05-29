'use strict';

define(function () {
  // Create the Audio Context
  var audiocontext = new window.AudioContext();

  /**
   * <p>Returns the Audio Context for this sketch. Useful for users
   * who would like to dig deeper into the <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext for this sketch
   */
  p5.prototype.getAudioContext = function() {
    return audiocontext;
  };

  // if it is iOS, we have to have a user interaction to start Web Audio
  // http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
  var iOS =  navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false ;
  if (iOS) {
    var iosStarted = false;
    var startIOS = function() {
      if (iosStarted) return;

      // create empty buffer
      var buffer = audiocontext.createBuffer(1, 1, 22050);
      var source = audiocontext.createBufferSource();
      source.buffer = buffer;

      // connect to output (your speakers)
      source.connect(audiocontext.destination);
      // play the file
      source.start(0);
      console.log('start ios!');

      if (audiocontext.state === 'running') {
        iosStarted = true;
      }
    };
    document.addEventListener('touchend', startIOS, false);
    document.addEventListener('touchstart', startIOS, false);

    // TO DO: fake touch event so that audio will just start
  }

  return audiocontext;
});
