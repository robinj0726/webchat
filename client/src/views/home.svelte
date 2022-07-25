<script>
    import { useNavigate } from "svelte-navigator";

    import Textfield from '@smui/textfield';
    import Button from '@smui/button';

    const navigate = useNavigate();
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
      <Button variant="unelevated" on:click="{() => navigate('videocall')}">Join Meeting</Button>
    </div>  
</main>

<style>
    main {
      margin-top: 15rem;
      padding: 0;
      text-align: center;
    }
</style>
  