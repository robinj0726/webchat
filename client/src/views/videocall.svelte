<script>
    import { onMount } from 'svelte';
    
    import { StartWebRTC } from '../util/callController.js';

    onMount(async ()=>{
        StartWebRTC();
    }); 

</script>
<h1>Video Call</h1>