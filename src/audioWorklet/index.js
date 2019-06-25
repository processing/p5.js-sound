const p5sound = require('master');
const moduleSources = [
  require('raw-loader!./recorderProcessor').default
];
const ac = p5sound.audiocontext;

function loadAudioWorkletModules() {
  return Promise.all(moduleSources.map(function(moduleSrc) {
    const blob = new Blob([moduleSrc], { type: 'application/javascript' });
    const objectURL = URL.createObjectURL(blob);
    return ac.audioWorklet.addModule(objectURL);
  }));
}

p5.prototype.registerMethod('init', function() {
  // ensure that a preload function exists so that p5 will wait for preloads to finish
  if (!this.preload && !window.preload) {
    this.preload = function() {};
  }
  // use p5's preload system to load necessary AudioWorklet modules before setup()
  this._preloadCount++;
  const onWorkletModulesLoad = function() {
    this._decrementPreload();
  }.bind(this);
  loadAudioWorkletModules().then(onWorkletModulesLoad);
});
