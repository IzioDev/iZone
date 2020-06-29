<script>
  export let onSubmited;
  let zoneName = "";
  let categoryName = "";
  let errorMessageElement;

  function submitZoneName() {
    if (zoneName.length == 0 || categoryName.length == 0) {
      errorMessageElement.innerHTML = "Don't let fields empty"
    } else if (zoneName.indexOf(" ") != -1 || categoryName.indexOf(" ") != -1) {
      errorMessageElement.innerHTML = "The fields cannot contains whitespace"
    } else {
      onSubmited({ name: zoneName, cat: categoryName });
    }
  }
</script>

<div class="form">
  <form name="save">
    <p bind:this={errorMessageElement} class="error-message"></p>
    <label for="name">Zone Name:</label>
    <input
      type="text"
      id="name"
      name="name"
      placeholder="zoneName"
      bind:value={zoneName} />
    <label for="cat">Category Name:</label>
    <input
      type="text"
      id="cat"
      name="cat"
      placeholder="catName"
      bind:value={categoryName} />
    <button type="button" class="submit" on:click={submitZoneName}>Save</button>
  </form>
</div>

<style>
.error-message {
  color: red;
}
</style>