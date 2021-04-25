/**
 *  @name  Note Envelope
 *  @description  <p>An Envelope is a series of fades, defined
 *  as time / value pairs. In this example, the envelope
 *  will be used to "play" a note by controlling the output
 *  amplitude of an oscillator.<br/><br/>
 *  The p5.Oscillator sends its output through
 *  an internal Web Audio GainNode (p5.Oscillator.output).
 *  By default, that node has a constant value of 0.5. It can
 *  be reset with the osc.amp() method. Or, in this example, an
 *  Envelope takes control of that node, turning the amplitude
 *  up and down like a volume knob.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a> and a
 * sound file.</span></em></p>
 */
var osc, envelope, fft;
var myPhraseAttack, myPhraseRelease, myPart;
var atPattern = [1, 0];
var relPattern = [0, 1];
var scaleArray = [60, 62, 64, 65, 67, 69, 71, 72];
var note = 0;
var expOrNot = 1;
var startPoint = 0;
var endPoint = 0;
var numWaveforms = 50;

var audioContext;

function setup() {
  createCanvas(710, 200);
  osc = new p5.SinOsc();

  audioContext = getAudioContext();

  // Instantiate the envelope with time / value pairs
  envelope = new p5.Envelope(0.1, 0.5, 0.01, 0.0, 0.0, 0.0, 0.0, 0.0);
  osc.amp(0.);
  osc.start();
  myPhraseAttack = new p5.Phrase('testerAttack', makeSoundAttack, atPattern);
  myPhraseRelease = new p5.Phrase('testerRelease', makeSoundRelease, relPattern);
  myPart = new p5.Part();
  myPart.addPhrase(myPhraseAttack);
  //myPart.addPhrase(myPhraseRelease);
  myPart.setBPM(120);
  myPart.loop();
  myPart.start();
  fft = new p5.FFT();
  fft.setInput(osc);
  outputVolume(0);
  endPoint = width / numWaveforms;
  noStroke();
  background(20);
}

function draw() {
  
  var waveform = fft.waveform();  // analyze the waveform
  beginShape();
  strokeWeight(5);
  for (var i = 0; i < waveform.length; i++){
    var x = map(i, 0, waveform.length, startPoint, endPoint);
    var y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();
  startPoint = endPoint + 1;
  endPoint += (width / numWaveforms);
  if (endPoint > width)
  {
    background(20);
    startPoint = 0;
    endPoint = (width / numWaveforms);
  }
  
  
}


function makeSoundAttack(time, playbackRate) 
{
  var midiValue = scaleArray[note];
  var freqValue = midiToFreq(midiValue);
  
  if (note == 0)
  {
    // if (expOrNot == 0)
    // {
    //     envelope.setExp(true);
    //     expOrNot = 1;
    // }
    // else
    // {
    //     envelope.setExp(false);
    //     expOrNot = 0;
    // }
  }

  osc.freq(freqValue * 2, 0, time);
  // envelope.play(osc, time);
  envelope.triggerAttack(osc, time);
  //envelope.triggerRelease(osc);
  note = (note + 1) % scaleArray.length;
  setTimeout(redrawWaveform, time * 1000.0);

}

function makeSoundRelease(time, playbackRate) 
{
   envelope.triggerRelease(osc, time);
}

function redrawWaveform()
{
  background(20);
  startPoint = 0;
  endPoint = (width / numWaveforms);
}
