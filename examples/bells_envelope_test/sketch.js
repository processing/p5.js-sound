
// This example shows a more complex use of the .ramp function for the envelope. 
// You can use it to make a simple attack/decay envelope for struck or plucked style notes.
// Here, we're creating synthetic bells using additive synthesis, and triggering each of their attacks and decays differently to make different harmonics last for different times.
// Have fun! - Jeff Snyder
var osc = [];
var envelope = [];
var fft;
var myPhraseAttack, myPhraseRelease, myPart;
var atPattern = [1, 1,1,1,0,1,1,1,1,0,0,0,0]; // this rhythmic pattern puts some rests in there
var patternArray = [0,1,2,3,3,2,0,1]; // pattern of the notes (in terms of array indices from scaleArray)
var scaleArray = [64, 60, 62, 55]; // classic bell tune
var harmonicsArray = [.5, 1., 1.183, 1.506, 2., 2.514, 2.662, 3.011, 4.166, 5.433, 6.796, 8.215]; // bell partials taken from https://en.wikipedia.org/wiki/Strike_tone
var idealArray = [.5, 1., 1.2, 1.5, 2, 2.5, 2.6667, 3.0, 4.0, 5.3333, 6.6667, 8.0]; // ideal bell partials
var note = 0;
var startPoint = 0;
var endPoint = 0;
var numWaveforms = 100;
var numOsc = 12;  // reduce this to reduce the number of overtones, 4 makes a nice, dark gamelan sound
var numNotes = 4;
var rawImpulse;
var cVerb;
var oscVols = [];
var firstNote = 1;
var pitchRatio = .8; //change this to transpose things around
var pitchDeviation = .001;
var idealOrReal = 0; // change this to 1 to change to an ideal bell instead of a measured bell
var maxAttack = .001; // in seconds ... setting to .001 makes things very percussive, setting to > 1 makes them sound far away
var maxDecay = 9.0; // in seconds ... short times make for deader bells
var percentWashed = 0.0;
var washedMax = 4;


function preload()
{
  // create a p5.Convolver
  cVerb = createConvolver('assets/LadyChapelStAlbansCathedral.wav');
    
}

function setup() 
{
  createCanvas(1000, 400);
  rawImpulse = loadSound('assets/' + cVerb.impulses[0].name);

  for (var i = 0; i < numNotes; i++)
  {
    // make the arrays into 2D arrays
    osc[i] = [];
    envelope[i] = [];
    oscVols[i] = [];
    var midiValue = scaleArray[i];
    var freqValue = midiToFreq(midiValue);
    
    for(var j = 0; j < numOsc; j++)
    {
      // make arrays of sine waves for each note, additive synthesis, and assign independent envelopes, amplitudes, and slight detunings for each harmonic
      osc[i][j] = new p5.SinOsc();
      envelope[i][j] = new p5.Envelope();
      if (random(0, 1) > percentWashed)
      {
        myMaxAttack = maxAttack;
        print("normal");
      }
      else 
      {
        myMaxAttack = washedMax;
        print("washed");
      }
      envelope[i][j].setADSR(random(.001, myMaxAttack), random(.01, maxDecay)); // turning sustain level to 0. makes an AD envelope
      osc[i][j].amp(0.);
      oscVols[i][j] = random(.01, .3);
      if (idealOrReal == 0)
      {
        var myOvertone = harmonicsArray[j];
      }
      else
      {
        var myOvertone = idealArray[j];
      }
      osc[i][j].freq(freqValue * harmonicsArray[j] * random(1.0 - pitchDeviation, 1 + pitchDeviation) * pitchRatio);
      osc[i][j].start();
      osc[i][j].disconnect();
      //put 'em through that reverb, ahhhhhh yeah it's like a New Age in here
      cVerb.process(osc[i][j]);
    }
  }
  myPhraseAttack = new p5.Phrase('testerAttack', makeSoundAttack, atPattern);
  myPart = new p5.Part();
  myPart.addPhrase(myPhraseAttack);
  myPart.setBPM(15);  // super slow because it's in 16th notes
  myPart.loop();
  myPart.start();
  fft = new p5.FFT(); // for the drawing of the waveform (just using the buffer part)
  endPoint = width / numWaveforms; // for the drawing
  background(20);
}

function draw() 
{
  background(0, 0, 0, 9); //to make the trails fade like on a scope :)
  var waveform = fft.waveform();  // analyze the waveform
  fft.analyze();
  beginShape();
  noFill();
  stroke(fft.getEnergy("bass") * 2.0, fft.getEnergy("mid")* 2.0, fft.getEnergy("treble") * 2.0); // the (* 2.0) is just to make the colors a little brighter
  for (var i = 0; i < waveform.length; i++)
  {
    var x = map(i, 0, waveform.length, startPoint, endPoint);
    var y = map(waveform[i], -.9, .9, height, 0);
    vertex(x, y);
  }
  endShape();
  startPoint = endPoint + 1;
  endPoint += (width / numWaveforms);
  if (endPoint > width)
  {
    redrawWaveform();
  }
}

function makeSoundAttack(time, playbackRate) 
{
  var whichNote = patternArray[note];
  for (var i = 0; i < numOsc; i++)
  {
    envelope[whichNote][i].ramp(osc[whichNote][i], time, (oscVols[whichNote][i] * random(.8, 1.0)), 0); // the added randomness just makes each strike a little different.
  }
  note = (note + 1) % patternArray.length;
  if (firstNote == 1)
  {
    setTimeout(redrawWaveform, time * 1000.0); // just so the drawing display starts at the left on the first note
  }
  firstNote = 0;
}


function redrawWaveform()
{
  startPoint = 0;
  endPoint = (width / numWaveforms);
}
