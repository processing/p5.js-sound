
var ptable;

function setup() {
  createCanvas(800, 300);
  ptable = loadJSON('Trombone.json'); 
  console.log(ptable);

}

function draw(){
	background(0);
}

function parseJSON (json){
	console.log(json);
}
