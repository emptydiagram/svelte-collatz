let initValueText = '4';
let DEFAULT_INIT_VALUE = 20;
let RAND_UPPER_BOUND = 100;

function getRandInitValue() {
  return getRandomInt(2, RAND_UPPER_BOUND);
}


// Math.random() returns value in [0, 1)
// this returns integer in range [min, max]
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let makeInitContext = initValue => ({
    initValue: initValue,
    value: initValue,
    history: [initValue]
});

let initFromRandom = assign(ctxt => {
  let initValue = getRandInitValue();
  return makeInitContext(initValue);
});

let initFromText = assign(ctxt => {
  let initValue = parseInt(initValueText);
  return makeInitContext(initValue);
});

const collatzingStates = {
  initial: 'running',
  states: {
    running: {
      on: {
        '': {
          target: 'finished',
          cond: { type: 'isWalkFinished' }
        },
        STEP: {
          actions: assign(ctxt => {
            let v = ctxt.value;
            let newValue = v % 2 === 0 ? v / 2 : 3 * v + 1;
            return {
              value: newValue,
              history: [...ctxt.history, newValue],
            };
          })
        },
      }
    },

    finished: {
      type: 'final'
    }
  }
}

const collatzMachine = Machine(
  {
    id: 'collatz',
    initial: 'collatzing',
    context: {
      initValue: DEFAULT_INIT_VALUE,
      value: DEFAULT_INIT_VALUE,
      history: [DEFAULT_INIT_VALUE],
    },
    states: {
      collatzing: {
        on: {
          RAND_INIT: {
            target: 'collatzing.running',
            actions: initFromRandom
          },
          INIT_FROM_VALUE: {
            target: 'collatzing.running',
            actions: initFromText
          },
        },
        ...collatzingStates
      }
    }
  },
  {
    guards: {
      isWalkFinished: (context, event) => context.value == 1
    },
  }
);
