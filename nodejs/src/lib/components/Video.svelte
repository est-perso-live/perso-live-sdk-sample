<script lang=ts>
	import { onMount } from "svelte";

    export let width: number;
    export let height: number;
    export let onVideoReady: (element: HTMLVideoElement) => void

    let videoElement: HTMLVideoElement;

    onMount(() => {
        videoElement.style = `width:${width}px; height:${height}px;`;

        onVideoReady(videoElement);
    });
</script>
<video class="border1px" bind:this={videoElement} autoplay playsinline></video>