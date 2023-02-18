// Example: Record a sound and then play it back.
// We need p5.AudioIn (mic / sound source), p5.SoundRecorder
// (records the sound), and a p5.SoundFile (play back).

let mic, recorder, soundFile;

let isRecordingStarted = false;
let isResultPlayed = false;

function setup() {
  createCanvas(400, 400);
  background(200);
  fill(0);
  text('Enable mic and click the mouse to begin recording', 20, 20);

  // create an audio in
  mic = new p5.AudioIn();

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  // connect the mic to the recorder
  recorder.setInput(mic);

  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();
}

function mousePressed() {
  userStartAudio();
  // use the '.enabled' boolean to make sure user enabled the mic (otherwise we'd record silence)
  if (!isRecordingStarted && !isResultPlayed) {
    // users must manually enable their browser microphone for recording to work properly!
    mic.start(function () {
      // Tell recorder to record to a p5.SoundFile which we will use for playback
      recorder.record(soundFile);

      background(255, 0, 0);
      text('Recording now! Click to stop.', 20, 20);
      isRecordingStarted = true;
    });
  } else if (isRecordingStarted && !isResultPlayed) {
    recorder.stop(); // stop recorder, and send the result to soundFile
    mic.dispose();
    background(0, 255, 0);
    text('Recording stopped. Click to play', 20, 20);
    isResultPlayed = true;
  } else if (isRecordingStarted && isResultPlayed) {
    soundFile.play(); // play the result!
  }
}
