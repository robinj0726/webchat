<script>
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';

  let roomNo = '';
  let userName = '';
</script>

<main>
  <div>
    <Textfield 
      style="width: 30%;"
      bind:value={roomNo} 
      label="Room Number:">
    </Textfield>
  </div>
  <div>
    <Textfield 
      style="width: 30%;"
      bind:value={userName} 
      label="Nick Name:">
    </Textfield>
  </div>
  <div style="margin: 1rem;">
    <Button variant="unelevated">Join Meeting</Button>
  </div>  
</main>

<style>
  main {
    margin-top: 15rem;
    padding: 0;
    text-align: center;
  }
</style>
