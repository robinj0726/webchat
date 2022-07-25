<script>
    import { useNavigate } from "svelte-navigator";

    import Textfield from '@smui/textfield';
    import Button from '@smui/button';
    import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

    import { onMount } from 'svelte';
    import { newCallController } from './util/newCallController.js';

    const navigate = useNavigate();
    
    let roomNo = '';
    let userName = '';

    onMount(async ()=>{
      newCallController("2022", {});
    }); 
</script>

<main>
    <TopAppBar
      variant="static"
      dense={false}
      color='secondary'>
        <Row>
            <div style="margin-top: 1rem;">
                <Title>Web Meeting Demo</Title>
            </div>
        </Row>    
    </TopAppBar>
    <div style="margin-top:10rem;">
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
      margin: 0;
      padding: 0;
      text-align: center;
    }
</style>
  