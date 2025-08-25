<script lang="ts">
	let { time, size = 400  } = $props();

	const xmlCodes = [
		'#000',
		'#963',
		'#f00',
		'#f80',
		'#cc0',
		'#0c0',
		'#00f',
		'#f0f',
		'#888',
		'#fff'
	];

	function getColor(time:number, idx:number){
		let place = [...Math.floor(time / 1000)
				.toString()
				.padStart(4, '0')
		].map((a, i) => Number(a))[idx]
		return xmlCodes[place]
	};

</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="width:{size}px; height:{size}px;">
	<path 
	    d="M 1 1 L 1 15 15 15 15 1 Z"
		style="stroke-width:2;stroke-linejoin:miter;stroke-linecap:butt;stroke:#ffffff;fill:{getColor(time,0)}; paint-order:stroke;">
	</path>
	<path d="M 2 2 L 5 2 5 3 3 3 3 4 4 4 4 5 3 5 3 7 2 7 Z" style="fill:#ffffff;"></path>
	<path d="M 2 8 L 2 15 5 15 5 8 Z" style="fill:{getColor(time,1)};"></path>
	<path d="M 6 7 L 6 15 14 15 14 7 Z"	style="fill:{getColor(time,3)};"></path>
	<path d="M 6 2 L 6 6 14 6 14 2 Z" style="fill:{getColor(time,2)};"></path>
</svg>
