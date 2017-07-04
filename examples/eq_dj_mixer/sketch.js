var soundFile1, soundFile2;
var fft1, fft2;


//Knob controls

//colors
var knobBckg, knobLine;

//dimensions
var knobRad, knobLineLen;

//global control variables
var pressed, cntrlIndex;

var description;

//Deck UI
var deckWidth, deckHeight;
var deck1x, deck1y, deck2x, deck2y;
var fftWidth, fftHeight;

var buttonWidth, buttonHeight;

var sliderLength, sliderx, slidery;

//0-5 = EQ
//6 = deck 1 volume
//7 = deck 2 volume
//8 = channel fader
//9 - 12 = buttons
var mixer = [];
var eq1, eq2;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile1 = loadSound('../files/beat');
  soundFile2 = loadSound('../files/beatbox');
}


function setup() {
  createCanvas(1080, 680);

  pressed = false;
  angleMode(DEGREES);

 

  eq1 = new p5.EQ(3);
  eq2 = new p5.EQ(3);

  soundFile1.disconnect();
  soundFile2.disconnect();

  soundFile1.loop();
  soundFile2.loop();
  
  soundFile1.connect(eq1);
  soundFile2.connect(eq2);

  fft1 = new p5.FFT();
  fft2 = new p5.FFT();

  fft1.setInput(eq1);
  fft2.setInput(eq2);

  deckWidth = .4*width;
  deckHeight = .3*height;

  deck1x = 0;
  deck2x = 0.6*width;
  deck1y = 0.3*height;
  deck2y = 0.3*height;

  buttonWidth = .05*width;
  buttonHeight = .05*width; 

  sliderLength = deckWidth/2;
  sliderx = 40;
  slidery = 10;

 for (var i = 0; i < 3; i++) {
   mixer[i] = new Knob(i);
   mixer[i].x = 0.45*width;
   mixer[i].y = 1.5*deckHeight - 0.25*deckHeight*(i+1);
   eq1.bands[i].Q.value = 0.1;
 }

  for (var i = 5; i >= 3; i--) {
    mixer[i] = new Knob(i-3);
    mixer[i].x = width - 0.45*width;
    mixer[i].y = 1.5*deckHeight - 0.25*deckHeight*(i-2);
    eq2.bands[i-3].Q.value = 0.1;
  }

  for (var i = 6; i < 8; i++){
    mixer[i] = new SliderVert("vert",0.45*width + (i-6)*.1*width);
  }
  mixer[8] = new SliderHor("hor", 0.4*width, deck1y + 2*deckHeight );

 
  mixer[9] = new Button('play', deck1x + deckWidth/4, deck1y + 1.5*deckHeight,9);
  mixer[10] = new Button('mute', deck1x + deckWidth/2 , deck1y + 1.5*deckHeight,10);
  mixer[11] = new Button('play', deck2x + deckWidth/4, deck2y + 1.5*deckHeight,11);
  mixer[12] = new Button('mute', deck2x + deckWidth/2 , deck2y + 1.5*deckHeight,12);

  knobRad = .1*deckHeight;
  knobLineLen = knobRad/2;

  knobBckg = color(150);
  knobLine = color(30);

  description = createDiv("Simple Mixer using p5.EQ: <br>" +
    "Adjust the knobs to control 3 band EQ " +
    "use the sliders to control volumes, and crossfading.");
  description.size(.75*fftWidth, AUTO);
  description.position(width-fftWidth, 1.15*fftHeight);
}

function draw() {
  background(50);
  noStroke()
  fill(30);

  rect(deck1x, deck1y, deckWidth, deckHeight);
  rect(deck2x,deck2y, deckWidth, deckHeight);

  noStroke();
  fill(255);

  //deck1
 var spectrum1 = fft1.analyze();
 noStroke();
 for (var i = 0; i< spectrum1.length; i++){
   var x = map(i, 0, spectrum1.length, 0, deckWidth);
   var h = -deckHeight + map(spectrum1[i], 0, 255, deckHeight, 0);
   rect(x, deck1y + deckHeight, deckWidth/spectrum1.length, h) ;
 }
  //deck 2
  var spectrum2 = fft2.analyze();
  noStroke();
  for (var i = 0; i< spectrum2.length; i++){
    var x = map(i, 0, spectrum2.length, deck2x, deck2x+deckWidth);
    var h = -deckHeight + map(spectrum2[i], 0, 255, deckHeight, 0);
    rect(x, deck2y + deckHeight, deckWidth/spectrum2.length, h) ;
  }

  if (pressed) {mixer[cntrlIndex].change();}

  for (var i = 0; i < mixer.length; i++) {
    mixer[i].display();
  }
}

function Button(type,x,y, i) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.toggle = true;
  this.index = i;
  this.c = color(255,0,0)

  this.display = function() {
    fill(255,255,255);
    rectMode(CORNER);
    rect(this.x,this.y, buttonWidth, buttonHeight);
    this.graphic(this.type);
  };

  this.graphic = function(type) {
    if (type == 'play'){
      if(this.toggle){
        fill(0,255,0)
        beginShape(TRIANGLES);
          vertex(this.x + 0.2*buttonWidth, this.y + 0.2*buttonHeight);
          vertex(this.x + 0.8* buttonWidth, this.y + 0.5*buttonHeight);
          vertex(this.x + 0.2*buttonWidth, this.y + 0.8*buttonHeight);
        endShape();
        //this.index < 10 ? soundFile1.loop() : soundFile2.loop();
      } else {
        fill(255,0,0);
        beginShape(QUADS);
        vertex(this.x + 0.2*buttonWidth, this.y + 0.2*buttonHeight);
        vertex(this.x + 0.4*buttonWidth, this.y + 0.2*buttonHeight);
        vertex(this.x + 0.4*buttonWidth, this.y + 0.8*buttonHeight);
        vertex(this.x + 0.2*buttonWidth, this.y + 0.8*buttonHeight);
        vertex(this.x + 0.6*buttonWidth, this.y + 0.2*buttonHeight);
        vertex(this.x + 0.8*buttonWidth, this.y + 0.2*buttonHeight);
        vertex(this.x + 0.8*buttonWidth, this.y + 0.8*buttonHeight);
        vertex(this.x + 0.6*buttonWidth, this.y + 0.8*buttonHeight);
        endShape();
        //this.index < 10 ? soundFile1.stop() : soundFile2.stop();
      }
    } else if (type =='mute'){
      if (this.toggle){
        fill(0,255,0);
      } else {
        fill(255,0,0);
      }
      text('mute',this.x + buttonWidth/4,this.y+buttonHeight/2);
    }

    this.mouseOver = function () {
      if (mouseX > this.x && mouseX < this.x + buttonWidth
        && mouseY < this.y + buttonHeight && mouseY > this.y){
        return true;
      } else {
        return false;
      }
    }

    this.switch = function () {
      this.toggle = !this.toggle;

      if (this.type == 'mute') {
        if (!this.toggle) {
           this.index < 11 ? soundFile1.setVolume(0) : soundFile2.setVolume(0);
        } else {
          this.index < 11 ? soundFile1.setVolume(1) : soundFile2.setVolume(1);
        }
      } else if(this.type == 'play'){
        if (this.toggle) {
           this.index < 10 ? soundFile1.play() : soundFile2.play();
        } else {
          console.log(this.index);
          this.index == 9 ? soundFile1.pause() : soundFile2.pause();
        }
      }
    }

    this.change = function () {
     return 0;
    }
  }
}

function SliderVert(mode,x){
  this.mode = mode;
  this.x = x;
  this.y = deck1y+0.5*deckHeight;
  this.curPos = mode == "vert" ? this.y : this.x;
  this.sliderx  = 40;
  this.slidery = 10;
  this.index;

    this.display = function (){
      stroke(30);
      line(this.x, this.y, this.x, this.y+deckHeight);
      noStroke();
      fill(190);
      rectMode(CENTER)
      rect(this.x, this.curPos, this.sliderx, this.slidery);
    }

  this.mouseOver = function () {
    if (mouseX > this.x - this.sliderx/2 && mouseX < this.x + this.sliderx/2
      && mouseY < this.curPos + this.slidery/2 && mouseY > this.curPos - this.slidery/2){
      return true;
    } else {
      return false;
    }
  }

  this.change = function () {
     this.curPos = Math.min(Math.max(mouseY, this.y), this.y+deckHeight);
     cntrlIndex == 6 ? 
        soundFile1.setVolume(map(this.curPos, this.y, this.y+deckHeight, 1, 0))
        : soundFile2.setVolume(map(this.curPos, this.y, this.y+deckHeight, 1, 0));
  }
}

function SliderHor(mode,x, y){
  this.mode = mode;
  this.x = x;
  this.y = y;
  this.curPos = this.x+deckWidth/4;
  this.sliderx = 10;
  this.slidery = 40;

    this.display = function (){
      stroke(30);
      line(this.x, this.y, this.x+deckWidth/2, this.y);
      noStroke();
      fill(190);
      rectMode(CENTER)
      rect(this.curPos, this.y, slidery, sliderx);
    }

  this.mouseOver = function () {
    if (mouseX > this.curPos - this.sliderx/2 && mouseX < this.curPos + this.sliderx/2
      && mouseY < this.y + this.slidery/2 && mouseY > this.y - this.slidery/2){
      return true;
    } else {
      return false;
    }
  }

  this.change = function () {
    this.curPos = Math.min(Math.max(mouseX, this.x), this.x+deckWidth/2);
    map(this.curPos, this.x, this.x+deckWidth/2, -1, 1) < 0 ?
      soundFile2.setVolume(map(this.curPos, this.x+deckWidth/4, this.x, 1, 0))
      : soundFile1.setVolume(map(this.curPos, this.x+deckWidth/4, this.x+deckWidth/2, 1, 0));
  }
}

function Knob(i){
  this.type = i;
  this.range = [-40,40];
  this.default = 0;
  this.current = 0;
  this.curAngle = map(this.current, this.range[0], this.range[1],50,320);
  this.x;
  this.y;
  this.index = i;

  this.display = function () {
    noStroke();
    fill(knobBckg);
    ellipse(this.x, this.y, knobRad,knobRad);
    //draw the indicator line from knob center
    translate(this.x,this.y);
    rotate(this.curAngle);
    stroke(knobLine);
    line(0,0,0,knobLineLen);
    rotate(-this.curAngle);
    translate(-this.x,-this.y);
  }

  this.mouseOver = function () {
    if (mouseX > this.x - knobLineLen && mouseX < this.x + knobLineLen
      && mouseY < this.y + knobLineLen && mouseY > this.y - knobLineLen){
      return true;
    } else {
      return false;
    }
  }

  this.change = function () {
     translate(this.x, this.y);
     var a = atan2(mouseY - this.y, mouseX - this.x);
     //console.log(a);
     this.curAngle = a - 90;

     if (this.curAngle < 0) {this.curAngle = this.curAngle + 360;}
     if (this.curAngle < 50 ) {this.curAngle = 50;}
     else if (this.curAngle > 320) {this.curAngle = 320;}
    this.current = map(this.curAngle, 50, 320, -40,40);
    if(cntrlIndex < 3) { 
        eq1.setBand(this.index, "mod", this.current)
      }else{
        eq2.setBand(this.index, "mod", this.current);
      }
    translate(-this.x,-this.y);
  }
}

function mousePressed(){
  for (var i = 0; i < mixer.length; i++) {
    if (mixer[i].mouseOver()){ 
      pressed = true; 
      cntrlIndex = i;
      break;
    }

  }
}

function mouseReleased(){
  pressed = false;
}

function mouseClicked() {

  for (var i = 9; i < mixer.length; i++) {
      if (mixer[i].mouseOver()){ 
        mixer[i].switch()
      }

    }
  
}
