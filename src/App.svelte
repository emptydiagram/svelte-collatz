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
        value: 5
      },
      states: {
        collatzing: {
          on: {
            '': {
              target: 'finished',
              cond: { type: 'isWalkFinished' }
            },
            STEP: {
              actions: assign({
                value: ctxt => {
                  let v = ctxt.value;
                  return v % 2 === 0
                    ? v / 2
                    : 3 * v + 1;
                },
              })
            },
          }
        },
        finished: {
          on: {
            RAND_INIT: {
              target: 'collatzing',
              actions: assign({
                value: ctxt => {
                  return getRandomInt(2, 20);
                },
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
		color: purple;
	}

</style>

<h1>Hello {name}!</h1>

<h2>{machineState.context.value}</h2>

<div>
  <button disabled={isFinished} on:click={stepCollatzer}>step</button>
</div>

{#if isFinished}
  <div>
    <p>process stopped</p>
    <button on:click={startFromRandom}>initialize with random</button>
  </div>
{/if}

