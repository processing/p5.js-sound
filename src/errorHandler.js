/*
    Helper function to generate an error
    with a custom stack trace that points to the sketch
    and removes other parts of the stack trace.

    @private
    @class customError
    @constructor
    @param  {String} name         custom  error name
    @param  {String} errorTrace   custom error trace
    @param  {String} failedPath     path to the file that failed to load
    @property {String} name custom error name
    @property {String} message custom error message
    @property {String} stack trace the error back to a line in the user's sketch.
                             Note: this edits out stack trace within p5.js and p5.sound.
    @property {String} originalStack unedited, original stack trace
    @property {String} failedPath path to the file that failed to load
    @return {Error}     returns a custom Error object
   */
var CustomError = function (name, errorTrace, failedPath) {
  var err = new Error();
  var tempStack, splitStack;

  err.name = name;
  err.originalStack = err.stack + errorTrace;
  tempStack = err.stack + errorTrace;
  err.failedPath = failedPath;

  // only print the part of the stack trace that refers to the user code:
  splitStack = tempStack.split('\n').filter(function (ln) {
    return !ln.match(/(p5.|native code|globalInit)/g);
  });
  err.stack = splitStack.join('\n');

  return err; // TODO: is this really a constructor?
};
export default CustomError;
