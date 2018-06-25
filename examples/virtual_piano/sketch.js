var keyMap = {};
var polySynth;
var baseNote = 60;
var key2keycode = {
  "0":"48","1":"49","2":"50","3":"51","4":"52","5":"53","6":"54","7":"55","8":"56",
  "9":"57","A":"65","B":"66","C":"67","D":"68","E":"69","F":"70","G":"71","H":"72",
  "I":"73","J":"74","K":"75","L":"76","M":"77","N":"78","O":"79","P":"80","Q":"81",
  "R":"82","S":"83","T":"84","U":"85","V":"86","W":"87","X":"88","Y":"89","Z":"90"
};
var keyWidth = 40;
var keyHeight = 40;

function setup() {
  createCanvas(720, 400);
  textAlign(LEFT, TOP);
  stroke(255);
  strokeWeight(2);

  // Prepare key-note mappings
  key_order = "ZSXDCVGBHNJMQ2W3ER5T6Y7UI9O0P"
  for (var i=0; i<key_order.length; i++) {
    keyMap[key_order[i]] = i;
  }

  // Create synth voices
  polySynth = new p5.PolySynth();
}

function draw() {
  background(235);
  
  var xpos = 30;
  var ypos = 120;
  var darkKeyColor = [20, 30, 200, 50];
  var lightKeyColor = [100, 100, 255, 50];

  for (var character of "1234567890") {
    if (character in keyMap) drawKey(xpos, ypos, character, darkKeyColor);
    xpos = xpos + keyWidth;
  }

  ypos = ypos + keyHeight;
  xpos = 50;
  for (var character of "QWERTYUIOP") {
    if (character in keyMap) drawKey(xpos, ypos, character, lightKeyColor);
    xpos = xpos + keyWidth;
  }
  
  ypos = ypos + keyHeight;
  xpos = 60;
  for (var character of "ASDFGHJKL") {
    if (character in keyMap) drawKey(xpos, ypos, character, darkKeyColor);
    xpos = xpos + keyWidth;
  }

  ypos = ypos + keyHeight;
  xpos = 80;
  for (var character of "ZXCVBNM") {
    if (character in keyMap) drawKey(xpos, ypos, character, lightKeyColor);
    xpos = xpos + keyWidth;
  }

}

function drawKey(xpos, ypos, key, keyColor) {
  stroke(255);
  // var keyColor = color(100, 100, 255, 50);
  if (keyIsDown(key2keycode[key])) {
    keyColor = [255, 100, 50, 50];
  }
  fill(keyColor);
  rect(xpos, ypos, keyWidth, keyHeight);
  fill(keyColor[0], keyColor[1], keyColor[2]);
  text(key, xpos+5, ypos+5);
}

function keyPressed() {
  // Check if valid note key pressed
  if (key in keyMap) {
    midiNoteNumber = baseNote + keyMap[key]; // 0-127; 60 is Middle C (C4)
    velocity = 0.1; // From 0-1
    freq = midiToFreq(midiNoteNumber);
    polySynth.noteAttack(freq, velocity, 0);
  }
}

function keyReleased() {
  // Check if valid note key pressed
  if (key in keyMap) {
    midiNoteNumber = baseNote + keyMap[key]; // 0-127; 60 is Middle C (C4)
    freq = midiToFreq(midiNoteNumber);
    polySynth.noteRelease(freq, 0);
  }
}
