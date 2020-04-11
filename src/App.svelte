<script>
  import { Machine, interpret, assign } from 'xstate';

  let initValueText;
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
    if (!isNaN(initValue)) {
      return makeInitContext(initValue);
    }
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

  const collatzService = interpret(collatzMachine);

  let machineState = collatzMachine.initialState;
  collatzService.onTransition(state => {
    console.log("transitioning to context = ", state.context, ", state = ", state.value);
    machineState = state;
  });

  collatzService.start();

  function stepCollatzer() {
    collatzService.send('STEP');
  }
  function startFromRandom() {
    collatzService.send('RAND_INIT');
  }
  function startFromTextInput() {
    collatzService.send('INIT_FROM_VALUE');
  }


  /* for display */
  // console.log("machineState = ", machineState);
  $: isFinished = machineState.value.collatzing === 'finished';

</script>

<style>
  #page {
    max-width: 35em;
  }

  h1 {
  }

  #collatz-display {
    margin: 5em 0;
  }

  #current-value {
    font-size: 2em;
    font-weight: bold;
  }

  #sequence-text {
    font-size: 0.75em;
  }

  #init-with-value {
    margin-top: 0.6em;
  }
  #init-with-rand {
    margin-top: 0.6em;
  }

  #init-value-input {
    width: 5em;
  }

  #start-of-notes {
    margin-top: 5em;
  }

  /* TODO */
  #sequence-of-values {
    font-size: 2em;
  }
</style>


<div id="page">
  <h1>Collatz problem</h1>
  <p>update function, Col, defined by these update equations:</p>

  <code><pre>
  n -> 3*n + 1
      when n is odd
  n -> n/2
      when n is even
  </pre></code>

  <p>Consider the sequence of values obtained by repeatedly applying the update function: (N, Col(N), Col(Col(N)), Col(Col(Col((N))), ...)</p>

  <div id="collatz-display">
    <p id="init-value-display">Starting from an initial value of <strong>{machineState.context.initValue}</strong>:</p>

    <p id="current-value">{machineState.context.value}</p>

    <div>
      <button disabled={isFinished} on:click={stepCollatzer}>step (apply Col)</button>
    </div>

    <p id="sequence-of-values"><span id="sequence-text">sequence:</span> [{machineState.context.history.join(', ')}]</p>
  </div>

  <div id="init-with-value">
    <input id="init-value-input" type="text" bind:value={initValueText}/>
    <button on:click={startFromTextInput}>initialize with value</button>
  </div>

  <button id="init-with-rand" on:click={startFromRandom}>initialize with random</button>

  {#if isFinished}
    <div>
      <p>reached 1 and stopped.</p>
    </div>
  {/if}

  <p id="start-of-notes">
    Notice that whenever it attains the value 1, if we were to apply the update equation, we would get 3*1 + 1 = 4 -> 2 -> 1 -> 4 -> ....
  </p>

  <p>The Collatz conjecture: for every positive integer n, when repeatedly updated using the update equations starting from n, it eventually attains 1 in its sequence of values.</p>

  <h3>External links</h3>
  <p><a href="http://www.ericr.nl/wondrous/">On the 3x + 1 problem</a></p>
  <p>"In 2017 the yoyo@home project checked all numbers up to 87.2<sup>60</sup> (± 1.003E+20) for convergence."</p>
  <p><a href="https://terrytao.wordpress.com/2019/09/10/almost-all-collatz-orbits-attain-almost-bounded-values/">Almost all Collatz orbits attain almost bounded values</a></p>
</div>
