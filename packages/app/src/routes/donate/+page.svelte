<script>
	import Readme from './README.md';
	import logo from '$lib/images/vox.svg';
	import BCH from '$lib/images/BCH.svg';
	import unspent from '$lib/images/unspent.svg';
</script>

<section>
	<h1>
		<a href="https://fundme.cash/campaign/116">TL;DR: Donate to FundMe #116</a>
	</h1>

	<Readme />

    <h1>
        Ways to give:
    </h1>

	<p>This is an active FundMe campaign for Vox</p>
	<a href="https://fundme.cash/campaign/116">Fundme Campaign #116</a>

	<p>This is a plain donation address:</p>
	<qr-code
		id="qr1"
		contents="bitcoincash:qz7xjt4xcpdu2gl75vrvkpwzfpjhy9hnm55gwzyvj4"
		module-color="#000"
		position-ring-color="#005200"
		position-center-color="#ffb7ff"
		mask-x-to-y-ratio="1.2"
		style="width: 250px;
									height: 250px;
									margin: 0.5em auto;
									background-color: #fff;"
	>
		<img src={BCH} width="50px" slot="icon" alt="Vox icon" />
	</qr-code>
	<pre>bitcoincash:qz7xjt4xcpdu2gl75vrvkpwzfpjhy9hnm55gwzyvj4</pre>

	<p>This is an irrevocable annuity address:</p>
	<qr-code
		id="qr1"
		contents="bitcoincash:pdmv95esl9sjzyp9h5rkqz24zr0kp4xxmttc037yc7wn84gtulx7x086f66qx"
		module-color="#000"
		position-ring-color="#005200"
		position-center-color="#ffb7ff"
		mask-x-to-y-ratio="1.2"
		style="width: 250px;
									height: 250px;
									margin: 0.5em auto;
									background-color: #fff;"
	>
		<img src={unspent} width="50px" slot="icon" alt="Vox perpetuity" />
	</qr-code>

	<pre
		style="font-size: small;">bitcoincash:pdmv95esl9sjzyp9h5rkqz24zr0kp4xxmttc037yc7wn84gtulx7x086f66qx</pre>
</section>
