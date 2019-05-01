<script>
	export let name;
	export let displayMenu = false;
	export let displayPrompt = false;
	export let currentDisp = 'help';
	export let isInUse = false;
	export let points = [];

	export let zones = [];

	function postRequest(endpoint, args) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", `http://izone/${endpoint}`, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.send(JSON.stringify(args));
	}

	function close(event) {
		displayMenu = false;
		postRequest('close', {});
	}

	function handleMessage(event) {
		console.log(JSON.stringify(event.data));
		if (event.data.openMenu) {
			displayMenu = true;
			isInUse = event.data.isInUse;
			points = event.data.points;
			zones = event.data.zones;
			console.log(zones)
		} else if (event.data.openPrompt) {
			displayPrompt = true;
		}
	}

	function switchTabTo(val) {
		currentDisp = val.toElement.id;
	}

	function tpToSelected(val) {
		let id = val.toElement.id;
		let coords = zones[id].center;
		postRequest('tp', coords);
		displayMenu = false;
	}

	function deleteSelected(val) {
		let id = val.toElement.id;
		postRequest('delete', {id: id});
		displayMenu = false;
	}

	function createZone(val) {
		postRequest('create', {});
		displayMenu = false;
	}

	function stopZone(val) {
		postRequest('stop', {});
		displayMenu = false;
	}

	function saveZone(val) {
		if (points.length <= 2) {
			postRequest('checkSave', {error: true});
		} else {
			postRequest('checkSsave', {error: false});
		}
		
		displayMenu = false;
	}

	function plop(val) {
 		var formEl = document.querySelector("#save-form");
		var formData = new FormData(formEl);
		let name = formData.get("name")
		let cat = formData.get("cat")
		 if (name.length == 0 || cat.length == 0) {
			postRequest('error', {message: "Don't let fields empty"});
		} else if ((name.indexOf(' ') != -1) || (cat.indexOf(' ') != -1)) {
			postRequest('error', {message: "Fields can't contains whitespace"});
		} else {
			postRequest('save', {name: name, cat: cat});
			displayPrompt = false;
		}
	}
</script>



<svelte:window on:message={handleMessage}/>
{#if displayPrompt}
	<div class="form">
		<form id="save-form" name="save">
			<label for="name">Zone Name:</label>
			<input type="text" id="name" name="name"
				placeholder="zoneName">
				<label for="cat">Categorie Name:</label>
			<input type="text" id="cat" name="cat"
				placeholder="catName">
			<p class="submit" on:click={plop}>Save</p>
		</form>
	</div>
{/if}
{#if displayMenu}
	<div class="container">
	<p on:click={close} class="close"><i class="material-icons center red clickable md-48">close</i></p>
	<p class="infos">iZone v1.3</p>
	<p class="title">Admin panel</p>
	<hr class="infos-sep">
		<div class="content">
			<div class="menu">
				<p on:click={switchTabTo} id="manage" class="item-menu"><i class="material-icons center">pageview</i> Manage Zones</p>
				{#if isInUse}
					<p on:click={stopZone} id="add" class="item-menu"><i class="material-icons center">delete</i> Stop Zone Creation</p>
					<p on:click={saveZone} id="add" class="item-menu"><i class="material-icons center">save</i> Save Zone</p>
				{:else}
					<p on:click={createZone} id="add" class="item-menu"><i class="material-icons center">add_circle</i> Create Zone</p>
				{/if}
				<p on:click={switchTabTo} id="help" class="item-menu"><i class="material-icons center">help</i> Help</p>
				<p on:click={switchTabTo} id="about" class="item-menu"><i class="material-icons center">info</i> About</p>
			</div>
			<div class="display">
				<!-- TODO: Use pagination for more than 7 zones -->
				{#if currentDisp == "manage"}
					<div class="center"> 
						<h2>Manage Zones</h2>
						<table class='center'>
							<thead>
							<tr>
								<td>
									Categorie
								</td>
								<td>
									Name
								</td>
								<td>
									Center
								</td>
								<td>
									TP
								</td>
								<td>
									Delete
								</td>
							</tr>
							</thead>
							<tbody>
								{#each zones as zone, i}
								<tr>
									<td>
										{zone.cat}
									</td>
									<td>
										{zone.name}
									</td>
									<td>
										x: {zone.center.x} y: {zone.center.y} z: {zone.center.z}
									</td>
									<td>
										<i on:click={tpToSelected} id="{i}" class="material-icons center clickable md-48">play_arrow</i>
									</td>
									<td>
										<i on:click={deleteSelected} id="{zone.id}" class="material-icons center red clickable md-48">delete_forever</i>
									</td>
								</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				{#if currentDisp == "help"}
					<div class="center"> 
						<h2>Help</h2>
						<p>To create a Zone, click on <span class='orange'>Create Zone</span> button. Add point by pressing the <span class='orange'>[L]</span> key. If you failed and you
						want to remove the last point, press <span class='orange'>[K]</span>.</p>
						<p>When you have finish, open up the admin panel: <span class='orange'>[E]</span> and click <span class='orange'>Save Zone</span>. If you want to stop the creation, click <span class='orange'>Stop Zone Creation</span></p>
						<p>A prompt will open, you'll have to enter a name and a categorie.</p>
					</div>
				{/if}

				{#if currentDisp == "about"}
					<div class="center"> 
						<h2>About</h2>
						<p><span class='orange'>iZone</span> is made by Izio to help developper and server administrators to create polygonal 2D zones.</p>
						<p>If you want to <span class='orange'>contribute</span> to this project, go on fivem.net forum, and follow the GitHub link.</p>
						<p>Feel free to <span class='orange'>report bug</span> or <span class='orange'>suggest new features</span>!</p>
					</div>
				{/if}
			</div>
			<!-- Hello {name}! -->
		</div>	
	</div>
{/if}

<style>
	@import url("https://fonts.googleapis.com/icon?family=Material+Icons");
	@font-face {
		font-family: 'Segoe UI';
		font-style: normal;
		font-weight: normal;
		src: local('Segoe UI'), url('Segoe UI.woff') format('woff');
	}
	p.submit {
		font-size: 42px;
		background-color: white;
		color: rgba(68, 63, 63, 0.9);
		width: 33%;
		margin: auto;
	}
	form {
		width: 100%;
		height: 100%;
		text-align: center;
	}
	.form {
		margin: auto;
		width: 33%;
		height: 33%;
		background-color: rgba(68, 63, 63, 0.9);
		color: white;
		display: inline-block;
		
	}
	.md-48 {
		font-size: 48px;
	}
	.red {
		color: red;
	}
	.clickable:hover {
		background-color: rgba(68, 63, 63, 0.9);
		color: #f1ab29; 
		cursor: pointer;
	}
	thead {
		color: #f1ab29;
	}
	table, td {
		border: 1px solid white;
	}
	td {
		padding: 10px;
	}
	table.center { 
		margin: auto;
	}
	div.center {
		width: 100%;
		height: 100%;
		margin: auto;
		text-align: center;
	}
	div.container {
		color: purple;
		background-color: rgba(37, 36, 36, 0.9);
		width: 75%;
		height: 75%;
		margin: auto;
		margin-top: 50vh;
		transform: translateY(-50%);
		border-radius: 15px;
		font-family: 'Segoe UI', Roboto;
		font-size: 2.5vh;
		color: #bdbdbd;
	}
	span.orange {
		color: #f1ab29;
	}
	div.content {
		padding-top: calc(35px + 1em);

	}
	h2 {
		color: white;
	}

	div.menu {
		float: left;
		width: 30%;
		height: 100%;
		border-style: solid;
		border-width: 2px;
		border-top: none;
		border-left: none;
		border-bottom: none;
		border-right-color: #bdbdbd;
	}

	div.display {
		float: right;
		width: calc(70% - 2px);
		max-height: 75%;
	}

	p.item-menu {
		margin: 0;
		padding-block-start: 0.5em;
		padding-block-end: 0.5em;
		text-align: center;
		border-style: solid;
		border-top: none;
		border-left: none;
		border-right: none;
		border-bottom-color: #bdbdbd;
	}

	p.item-menu:hover {
		color: #f1ab29;
		cursor: pointer;
		background-color: rgba(68, 63, 63, 0.9);
	}

	p.infos {
		position: fixed;
		right: 15px;
		top: 15px;
		margin: 0;
    	padding: 0;
		color: #f1ab29;
	}

	p.close {
		position: fixed;
		left: 15px;
		top: 15px;
		margin: 0;
    	padding: 0;
	}

	p.title {
		position: fixed;
		left: calc(50% - (124.44px)/2);
		top: 15px;
		margin: auto;
    	padding: 0;
		color: #f1ab29;
	}
	hr.infos-sep {
		width: 100%;
		margin: 0;
		position: fixed;
		top: 55px;
	}
	i.center {
		vertical-align: sub;
		font-size: 24px;
	}
</style>