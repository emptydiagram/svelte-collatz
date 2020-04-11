<script>
  import { Machine, interpret, assign } from 'xstate';
	export let name;

  // Math.random() returns value in [0, 1)
  // this returns integer in range [min, max]
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const collatzMachine = Machine(
    {
      id: 'collatz',
      initial: 'collatzing',
      context: {
        value: 5,
        history: [5],
      },
      states: {
        collatzing: {
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
          on: {
            RAND_INIT: {
              target: 'collatzing',
              actions: assign(ctxt => {
                let initValue = getRandomInt(2, 20);
                return {
                  value: initValue,
                  history: [initValue]
                };
              })
            },
          }
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

  $: isFinished = machineState.value === 'finished';


</script>

<style>
  h1 {
  }

  #trace {
    margin-bottom: 2em;
    font-size: 1.5em;
  }
  #init-with-value {
    margin-top: 0.6em;
  }
  #init-with-rand {
    margin-top: 0.6em;
  }
</style>


<h1>Collatz problem</h1>
<p>given these update equations:</p>

<code><pre>
n -> 3*n + 1
    when n is odd
n -> n/2
    when n is even
</pre></code>

<p>Starting from an initial value of <strong>5</strong>:</p>

<h2>{machineState.context.value}</h2>

<div>
  <button disabled={isFinished} on:click={stepCollatzer}>step</button>
</div>

<p id="trace">[{machineState.context.history.join()}]</p>

{#if isFinished}
  <div>
    <p>process stopped.</p>
    <button id="init-with-rand" on:click={startFromRandom}>initialize with random</button>
    <div id="init-with-value">
      <input type="text" />
      <button on:click>initialize with value</button>
    </div>
  </div>
{/if}
