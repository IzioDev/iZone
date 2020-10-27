<script>
  import { getContext } from "svelte";
  import ConfirmModal from "./components/ConfirmMordal.svelte";
  import ZoneNameModal from "./components/ZoneNameModal.svelte";

  const { open, close: closeModal } = getContext("simple-modal");

  export let displayMenu = false;
  export let currentDisp = "help";
  export let isInUse = false;
  export let points = [];
  export let zoneId = null;

  export const debug = false;

  export let zones = [];

  function postRequest(endpoint, args) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", `http://izone/${endpoint}`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(JSON.stringify(args));
  }

  function close(event) {
    displayMenu = false;
    postRequest("close", {});
  }

  function handleMessage(event) {
    if (event.data.openMenu) {
      displayMenu = true;
      isInUse = event.data.isInUse;
      points = event.data.points;
      zones = event.data.zones;
    } else if (event.data.openPrompt) {
      openZoneNamePrompt();
    } else if (event.data.refreshZones) {
      zones = event.data.zones;
    } else if (event.data.refreshState) {
      zoneId = event.data.zoneId
    }
  }

  function switchTabTo(val) {
    currentDisp = val.target.id;
  }

  function openZoneNamePrompt() {
    open(
      ZoneNameModal,
      {
        onSubmited: (val) => {
          postRequest("save", val);
          closeModal();
        },
      },
      {
        closeOnOuterClick: false,
      }
    );
  }

  function tpToSelected(val) {
    let id = val.target.id;
    let coords = zones[id].center;
    postRequest("tp", coords);
    displayMenu = false;
  }

  function deleteRequested(zone) {
    open(ConfirmModal, {
      message: `Are you sure you want to delete ${zone.name}?\nThis action cannot be undone.`,
      onAccepted: () => {
        closeModal();
        postRequest("delete", { id: zone.id });
        displayMenu = false;
      },
      onRefused: () => {
        closeModal();
      },
    });
  }

  function createZone(val) {
    postRequest("create", {});
    displayMenu = false;
  }

  function stopZone(val) {
    postRequest("stop", {});
    displayMenu = false;
  }

  function showZone(zone) {
    if (zone.id === zoneId) {
      return postRequest("unshowZone", {});
    }
    postRequest("showZone", {points: zone.points, id: zone.id});
  }

  function saveZone(val) {
    // bypass the check
    if (debug) {
      return openZoneNamePrompt();
    }

    if (points.length <= 2) {
      postRequest("checkSave", { error: true });
    } else {
      postRequest("checkSave", { error: false });
    }
  }

  if (debug) {
    displayMenu = true;
    isInUse = true;
    points = [];
    zones = [
      {
        id: 0,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 1,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 2,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 3,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 4,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 5,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 6,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 7,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 8,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
      {
        id: 9,
        cat: "Categorie",
        name: "Zone Name",
        center: {
          x: 158.15,
          y: 189.1,
          z: 89.001,
        },
      },
    ];
  }
</script>

<svelte:window on:message={handleMessage} />
{#if displayMenu}
  <div class="main-container">
    <p on:click={close} class="close">
      <i class="material-icons center red clickable md-48">close</i>
    </p>
    <p class="infos">iZone v1.4</p>
    <p class="title">Admin panel</p>
    <hr class="infos-sep" />
    <div class="content">
      <div class="menu">
        <p on:click={switchTabTo} id="manage" class="item-menu">
          <i class="material-icons center">pageview</i>
          Manage Zones
        </p>
        {#if isInUse}
          <p on:click={stopZone} id="add" class="item-menu">
            <i class="material-icons center">delete</i>
            Stop Zone Creation
          </p>
          <p on:click={saveZone} id="add" class="item-menu">
            <i class="material-icons center">save</i>
            Save Zone
          </p>
        {:else}
          <p on:click={createZone} id="add" class="item-menu">
            <i class="material-icons center">add_circle</i>
            Create Zone
          </p>
        {/if}
        <p on:click={switchTabTo} id="help" class="item-menu">
          <i class="material-icons center">help</i>
          Help
        </p>
        <p on:click={switchTabTo} id="about" class="item-menu">
          <i class="material-icons center">info</i>
          About
        </p>
      </div>
      <div class="display">
        <!-- TODO: Use pagination for more than 7 zones -->
        {#if currentDisp == 'manage'}
          <div class="center">
            <h2>Manage Zones</h2>
            <table class="center">
              <thead>
                <tr>
                  <td>Categorie</td>
                  <td>Name</td>
                  <td>Center</td>
                  <td>Show</td>
                  <td>TP</td>
                  <td>Delete</td>
                </tr>
              </thead>
              <tbody>
                {#each zones as zone, i}
                  <tr>
                    <!-- Category -->
                    <td>{zone.cat}</td>
                    <!-- Name -->
                    <td>{zone.name}</td>
                    <!-- Center -->
                    <td>
                      x: {Math.ceil(zone.center.x)} y: {Math.ceil(zone.center.y)}
                      z: {Math.ceil(zone.center.z)}
                    </td>
                    <!-- Show -->
                    <td>
                      <i
                        on:click={() => showZone(zone)}
                        id={i}
                        class="material-icons center clickable md-48">
                        {#if zoneId === zone.id}
                          visibility_off
                        {:else}
                          visibility
                        {/if}
                      </i>
                    </td>
                    <!-- TP -->
                    <td>
                      <i
                        on:click={tpToSelected}
                        id={i}
                        class="material-icons center clickable md-48">
                        play_arrow
                      </i>
                    </td>
                    <!-- Delete -->
                    <td>
                      <i
                        on:click={() => deleteRequested(zone)}
                        id={zone.id}
                        class="material-icons center red clickable md-48">
                        delete_forever
                      </i>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}

        {#if currentDisp == 'help'}
          <div class="center container">
            <h2>Help</h2>
            <ul class="help-list">
              <li>
                Create a Zone: click on the
                <span class="orange">Create Zone</span>
                button.
              </li>
              <li>
                Add points: press the
                <span class="orange">[L]</span>
                key (the keys can be changed in configuration file).
              </li>
              <li>
                Remove last point: press the
                <span class="orange">[K]</span>
                key.
              </li>
              <li>
                Save the zone: click on the
                <span class="orange">Save Zone</span>
                button, a prompt will ask you to enter a categorie name and a
                zone name.
              </li>
              <li>
                Stop the zone creation: click on the
                <span class="orange">Stop Zone Creation</span>
              </li>
            </ul>
          </div>
        {/if}

        {#if currentDisp == 'about'}
          <div class="center container">
            <h2>About</h2>
            <p>
              <span class="orange">iZone</span>
              is made by Izio to help developer and server owners to create
              polygonal 2D zones. It also provides few utilities to interract
              with the created zones.
            </p>
            <p>
              If you want to
              <span class="orange">contribute</span>
              to this project, go to the CitizenFx forum, and follow the GitHub
              link.
            </p>
            <p>
              Feel free to
              <span class="orange">report the bugs</span>
              or
              <span class="orange">suggest new features</span>
              !
            </p>
          </div>
        {/if}
      </div>
      <!-- Hello {name}! -->
    </div>
  </div>
{/if}

<style>
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
  table,
  td {
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
  div.main-container {
    color: purple;
    background-color: rgba(37, 36, 36, 0.9);
    width: 75%;
    height: 75vh;
    margin: auto;
    margin-top: 50vh;
    transform: translateY(-50%);
    border-radius: 15px;
    font-family: Roboto;
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
    height: calc(75vh - (35px + 1em));
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
    max-height: calc(75vh - (35px + 1em));
    overflow: auto;
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
    left: calc(50% - (124.44px) / 2);
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
