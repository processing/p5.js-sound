import Envelope from '../envelope';

class Env extends Envelope {
  constructor(t1, l1, t2, l2, t3, l3) {
    console.warn(
      'WARNING: p5.Env is now deprecated and may be removed in future versions. ' +
        'Please use the new p5.Envelope instead.'
    );
    super(t1, l1, t2, l2, t3, l3);
  }
}

export default Env;
