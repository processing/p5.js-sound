var sloop;
var bpm = 80; // 80 beats per minute

var numTimeSteps = 16;
var timeStepCounter = 0;
var pitches = [57,60,62,64,67,69,72,74,76,79,81,84]; // A minor pentatonic scale

var cells = [];
var cellWidth, cellHeight;

function setup() {
  createCanvas(720, 400);
  frameRate(10);

  // Prepare cells
  cellWidth = width / numTimeSteps;
  cellHeight = height / pitches.length;
  for (var i=0; i<numTimeSteps; i++) {
    for (var j=0; j<pitches.length; j++) {
      var x = i*cellWidth;
      var y = j*cellHeight;
      var pitch = pitches[pitches.length - j - 1]; // Pitches go from bottom to top
      cells.push(
        new Cell(createVector(x, y), pitch)
      );
    }
  }
  
  // Create a synth to make sound with
  synth = new p5.PolySynth();
  
  // Create SoundLoop with 8th-note-long loop interval
  sloop = new p5.SoundLoop(soundLoop, "8n");
  sloop.bpm = bpm;
  
  // UI
  playPauseButton = createButton('Play/Pause');
  playPauseButton.mousePressed(togglePlayPause);
  playPauseButton.position(10, height + 20);

  tempoSlider = createSlider(30, 300, bpm);
  tempoSlider.position(110, 420);
  tempoText = createP("BPM: " + bpm);
  tempoText.position(250, height + 8);
  
  clearButton = createButton('Clear All');
  clearButton.mousePressed(clearAll);
  clearButton.position(width - 60, height + 20);
}

function soundLoop(cycleStartTime) {
  for (var i=0; i<cells.length; i++) {
    if (floor(i / pitches.length) == timeStepCounter) {
      cells[i].active = true;
      if (cells[i].enabled) {
        // Play sound
        var velocity = 1; // Between 0-1
        var quaverSeconds = this._convertNotation('8n'); // 8th note = quaver duration
        var freq = midiToFreq(cells[i].pitch);
        synth.play(freq, velocity, cycleStartTime, quaverSeconds);
      }
    } else {
      cells[i].active = false;
    }
  }
  this.bpm = bpm;
  timeStepCounter = (timeStepCounter + 1) % numTimeSteps;
}

function draw() {
  background(255);
  for (var i=0; i<cells.length; i++) {
    cells[i].checkIfHovered();
    cells[i].display();
  }
  bpm = tempoSlider.value();
  tempoText.html("BPM: " + bpm);
}

function mouseClicked() {
  for (var i=0; i<cells.length; i++) {
    if (cells[i].hovered) {
      cells[i].enabled = !cells[i].enabled;
    }
  }
}

function togglePlayPause() {
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    sloop.start();
  }
}

function clearAll() {
  for (var i=0; i<cells.length; i++) {
    cells[i].enabled = false;
  }
}


var Cell = function(position, pitch) {
  // Sound
  this.pitch = pitch;
  // Appearance
  this.padding = 2;
  this.position = position.copy();
  this.width = cellWidth - 2 * this.padding;
  this.height = cellHeight - 2 * this.padding;
  this.defaultColor = [190, 240, 255];
  // Mouse hover
  this.hovered = false;
  this.hoverColor = [230, 255, 255];
  // Enabled when clicked
  this.enabled = false;
  var varyingColorVal = 22 * (this.pitch % pitches.length);
  this.enabledColor = [20 + varyingColorVal, 255 - varyingColorVal, 255];
  // Active when soundloop plays the cell
  this.active = false;
  this.activeColor = [230, 255, 255];
}

Cell.prototype.display = function() {
  noStroke();
  if (this.enabled) {
    fill(this.enabledColor[0], this.enabledColor[1], this.enabledColor[2]);
  } else if (this.hovered) {
    fill(this.hoverColor[0], this.hoverColor[1], this.hoverColor[2]);
  } else if (this.active) {
    fill(this.activeColor[0], this.activeColor[1], this.activeColor[2]);
  } else {
    fill(this.defaultColor[0], this.defaultColor[1], this.defaultColor[2]);
  }
  rect(this.position.x + this.padding, this.position.y + this.padding, this.width, this.height);
}

Cell.prototype.checkIfHovered = function() {
  var xMin = this.position.x + this.padding;
  var xMax = xMin + this.width;
  var yMin = this.position.y + this.padding;
  var yMax = yMin + this.height;
  if ((mouseX > xMin && mouseX < xMax) && (mouseY > yMin && mouseY < yMax)) {
    this.hovered = true;
  } else {
    this.hovered = false;
  }
}