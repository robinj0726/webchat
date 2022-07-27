<script>
    import { onMount } from 'svelte';
    
    import { OpenLocalMedia } from '../util/callController.js';

    onMount(async ()=>{
        OpenLocalMedia({
            audio: true,
            video: true    
        });
    }); 

</script>

<main id="video-container">
    <h1>Video Call</h1>
    <video class="full-screen-video" id="localVideo" autoplay playsinline>
        <track kind="captions" />
    </video>
    <video class="secondary-video" id="remoteVideo" autoplay playsinline>
        <track kind="captions" />
    </video>
</main>
  