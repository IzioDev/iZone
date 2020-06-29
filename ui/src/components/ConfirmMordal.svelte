<script>
  export let message;
  export let onAccepted;
  export let onRefused;
</script>

<p style="white-space: pre">{message}</p>
<button on:click={onAccepted}>Yes</button>
<button on:click={onRefused}>No</button>
