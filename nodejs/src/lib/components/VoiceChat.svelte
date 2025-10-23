<script lang="ts">
    export let enableButton: boolean;
    export let buttonText: string;
    export let onVoiceChatClicked: () => void;

</script>

<div class="input-method-container">
    <p style="width: 150px; margin-left: 14px; font-size: 24px; line-height: 28px;">Voice chat</p>
    <button
        style="width: 128px; height: 52px; margin-left: 14px; font-size: 24px; line-height: 28px;"
        disabled={!enableButton}
        on:click={onVoiceChatClicked}
    >
        {buttonText}
    </button>
</div>