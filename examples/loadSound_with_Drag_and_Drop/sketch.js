var soundArray = [];

var fileInput;
var dndSelect;
var container;

function setup(){
  createCanvas(500,100);

  container = getElement('container');

  dndSelect = createDiv();
  dndSelect.addClass('dndSelect');
  dndSelect.html('<em>Drag and Drop sounds here.</em>');

  //Event listeners for the file selection elements
  dndSelect.drop(gotFile);
  dndSelect.dragOver(dndDragHandler);
  dndSelect.dragLeave(dndResetBackground);

  fileInput = createFileInput(gotFile);
  fileInput.parent(container);

}


function draw(){
  background(240);

  for(i =0; i<soundArray.length; i++){
    if(soundArray[i].isPlaying()){
      fill(0,255,0);
    }
    else{
      fill(255,0,0);
    }
    rect(77*i,12.5,75,75);
  }
}

function mousePressed(){
  for(var i=0;i<soundArray.length;i++){
    if(mouseX > 77*i && mouseX < (77*i)+75 && mouseY > 12.5 && mouseY < 87.5){
      if(soundArray[i].isLoaded()){
        if(soundArray[i].isPlaying()){
          soundArray[i].stop();
        }
        else{
          soundArray[i].play();
        }
        break;
      }
    }
  }
}


// callback from fileInput and drag and drop
function gotFile(file){
  var newSF = loadSound(file);
  soundArray.push(newSF);
  dndResetBackground();
}

function dndDragHandler(evt){
  dndSelect.style('background-color', 'rgb(255,0,0)');
  evt.dataTransfer.dropEffect = 'copy';
}

function dndResetBackground() {
  dndSelect.style('background-color', 'rgb(230,230,230)');
}
