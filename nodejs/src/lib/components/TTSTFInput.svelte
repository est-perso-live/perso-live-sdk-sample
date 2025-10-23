<script lang="ts">
    export let enableSendButton: boolean;
    export let onMessageSubmit: (message: string) => void;

    let message: string = '';
    let trimmedMessage: string;
    $: {
        trimmedMessage = message.trim();
    }
    let ttstfMessageInput: HTMLInputElement;
    let sendButton: HTMLButtonElement;

    function messageSubmit() {
        onMessageSubmit(trimmedMessage);
        message = '';
    }
</script>

<div class="input-method-container">
    <p style="width: 300px; margin-left: 14px; font-size: 24px; line-height: 28px;">Make the chatbot speak using text</p>
    <input
        bind:this={ttstfMessageInput}
        type="text" style="width: 543px; height: 72px; font-size: 24px; padding-inline: 10px; margin-left: 18px;"
        on:keypress={
            (keyEvent) => {
                if (keyEvent.key === 'Enter' && !sendButton.disabled) {
                    messageSubmit();
                }
            }
        }
        bind:value={message}
    />
    <button
        bind:this={sendButton}
        style="width: 133px; height: 72px; font-size: 24px; line-height: 28px; margin-left: 12px;"
        on:click={ () =>
            messageSubmit()
        }
        disabled={!enableSendButton || trimmedMessage.length === 0}
    >
        Send
    </button>
</div>