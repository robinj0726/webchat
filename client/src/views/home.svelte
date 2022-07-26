<script>
    import { useNavigate } from "svelte-navigator";

    import Textfield from '@smui/textfield';
    import Button from '@smui/button';
    import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

    import { onMount } from 'svelte';
    import { NewCallController, NewVideoCall } from '../util/callController.js';

    const navigate = useNavigate();
    
    let roomNo = '';
    let userName = '';

    onMount(async ()=>{
      NewCallController();
    }); 

    function JoinRoom() {
      NewVideoCall(
        roomNo, 
        (response) => {
          if (response.status == 'ok') {
            navigate('videocall')
          }
        }
      )
    }
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
      <Button variant="unelevated" on:click="{ JoinRoom }">Join Meeting</Button>
    </div>  
</main>

<style>
    main {
      margin: 0;
      padding: 0;
      text-align: center;
    }
</style>
  