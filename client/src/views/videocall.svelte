<script>
    import { onMount } from 'svelte';
    
    import { StartWebRTC } from '../util/callController.js';

    onMount(async ()=>{
        StartWebRTC(true);
    }); 

</script>

<main id="video-container">
    <h1>Video Call</h1>
    <video class="full-screen-video" id="localVideo" autoplay playsinline></video>
    <video class="secondary-video" id="remoteVideo" autoplay playsinline></video>
</main>
  