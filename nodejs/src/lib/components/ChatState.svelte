<script lang="ts">
    export let enableStopSpeech: boolean;
    export let chatStateDescriptionText: string;
    export let onStopSpeechClicked: () => void;
</script>

<div class="input-method-container">
    <p style="width: 150px; margin-left: 14px; font-size: 24px; line-height: 28px;">Chat state : </p>
    <p style="width: 697px; margin-left: 14px; font-size: 24px; line-height: 28px;">
        {chatStateDescriptionText}
    </p>
    <button
        style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;"
        on:click={onStopSpeechClicked}
        disabled={!enableStopSpeech}
    >
        Stop Speech
    </button>
</div>