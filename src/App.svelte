<script>
	export let name;

  let counter = 0;

  function incCounter() {
    counter += 1;
  }

  function decCounter() {
    counter -= 1;
  }

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
