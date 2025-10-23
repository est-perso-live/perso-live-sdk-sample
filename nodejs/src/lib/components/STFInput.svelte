<script lang="ts">
    export let enableFileSelectButton: boolean;
    export let onStfFileSelected: (file: File) => void;

    let audioFileInput: HTMLInputElement;
    let stfFiles: FileList | null | undefined
    $: if (stfFiles != null) {
        onStfFileSelected(stfFiles[0]);
    }
</script>

<div class="input-method-container">
    <p style="width: 300px; margin-left: 14px; font-size: 24px; line-height: 28px;">Make the chatbot speak using audio(Experimental)</p>
    <input
        bind:this={audioFileInput}
        type="file" id="fileSelector" accept="audio/wav, audio/mp3" style="margin-left: 14px;"
        bind:files={stfFiles}
        on:click={ (e) => {
            audioFileInput.value = "";
        }}
        disabled={!enableFileSelectButton}
    />
</div>