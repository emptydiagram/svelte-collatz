<script>
  import { Machine, interpret, assign } from 'xstate';
	export let name;

  let counter = 0;
  function incCounter() {
    counter += 1;
  }
  function decCounter() {
    counter -= 1;
  }


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
  counterService.send('INC');
  counterService.send('INC');
  counterService.send('INC');
  counterService.send('DEC');
  counterService.send('INC');
  counterService.stop();
  console.log(machineState);
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>Hello {name}!</h1>

<h2>{ counter }</h2>

<div>
  <button on:click={incCounter}>inc</button>
  <button on:click={decCounter}>dec</button>
</div>
