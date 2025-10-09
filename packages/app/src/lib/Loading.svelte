<script>
	let count = 3;
	let time = 1.5;
	let delay = 0.2;
</script>

<span>
	{#each Array(count) as _, i}
	  <span style:--i={i} style:--time="{time}s" style:--delay="{delay}s">.</span>
	{/each}
</span>

<style>
  span {
    display: inline-block;
    font-size: large;
  }
	
  span > :where(span) {
    animation: bounce var(--time) infinite;
    animation-delay: calc(var(--i) * var(--delay));
  }
	
  @keyframes bounce {
    0%,
    25%,
    75%,
    100% {
      opacity: 1;
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      opacity: 0.5;
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
</style>
