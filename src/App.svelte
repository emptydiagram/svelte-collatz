<script>
  import { Machine, interpret, assign } from 'xstate';
	export let name;

  const counterMachine = Machine({
    id: 'counter',
    initial: 'counting',
    context: {
      count: 7
    },
    states: {
      counting: {
        on: {
          INC: {
            actions: assign({
              count: ctxt => ctxt.count + 1,
            })
          },
          DEC: {
            actions: assign({
              count: ctxt => ctxt.count - 1,
            })
          },
          RESET: {
            actions: assign({
              count: ctxt => 0,
            })
          },
        }
      }
    },
  });

  const counterService = interpret(counterMachine);

  let machineState = null;
  counterService.onTransition(state => {
    console.log("transitioning to context = ", state.context);
    machineState = state;
  });

  counterService.start();

  function incCounter() {
    counterService.send('INC');
  }
  function decCounter() {
    counterService.send('DEC');
  }
  function resetCounter() {
    counterService.send('RESET');
  }

</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>

<div>
  <button on:click={resetCounter}>reset</button>
</div>

<h2>{machineState.context.count}</h2>

<div>
  <button on:click={incCounter}>inc</button>
  <button on:click={decCounter}>dec</button>
</div>
