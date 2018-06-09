var osc, envelope, fft;
var myPhraseAttack, myPhraseRelease, myPart;
var atPattern = [1, 0,0,0];
var relPattern = [0, 0,1,0];
var scaleArray = [60, 62, 64, 65, 67, 69, 71, 72];
var note = 0;
var startPoint = 0;
var endPoint = 0;
var numWaveforms = 50;

function setup() {
  createCanvas(710, 200);
  osc = new p5.SinOsc();
  envelope = new p5.Envelope(0.1, 1.0, 0.1, .5, .1, .5, .1, 0.0); // 
  envelope.setExp(true);
  //envelope.setADSR(0.1, 1.0, 1.0, 0.2, 5.0, 0.0); //AT, AL, DT, SL, RT, RL
  osc.amp(0.);
  osc.start();
  myPhraseAttack = new p5.Phrase('testerAttack', makeSoundAttack, atPattern);
  myPhraseRelease = new p5.Phrase('testerRelease', makeSoundRelease, relPattern);
  myPart = new p5.Part();
  myPart.addPhrase(myPhraseAttack);
  myPart.addPhrase(myPhraseRelease);  // comment this back in to check release 
  myPart.setBPM(100);
  myPart.loop();
  myPart.start();
  fft = new p5.FFT();
  endPoint = width / numWaveforms;
  noFill();
  background(20);
}

function draw() {
  
  
  var waveform = fft.waveform();  // analyze the waveform
  beginShape();
  stroke(255, 255, 0);
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
  osc.freq(freqValue * 2, .01, time); // comment this back in to check pitch changes
  envelope.play(osc, time);
  //envelope.triggerAttack(osc, time);
  note = (note + 1) % scaleArray.length;
  setTimeout(redrawWaveform, time * 1000.0);

}

function makeSoundRelease(time, playbackRate) 
{
   //envelope.triggerRelease(osc, time);  // comment this back in to check release
}

function redrawWaveform()
{
  background(20);
  startPoint = 0;
  endPoint = (width / numWaveforms);
}
