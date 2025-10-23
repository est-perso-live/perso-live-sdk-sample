<script lang="ts">
	import type { Chat } from "$lib/session";

    export let chatLog: Array<Chat>;
</script>

<style>
    .message-container {
        display: flex;
        flex-direction: column;
    }
    .message-container.user {
        margin-left: auto;
        align-items: flex-end;
    }
    .message-container.other {
        margin-right: auto;
        align-items: flex-start;
    }
    .message {
        padding: 18px 20px;
        border-radius: 20px;
        max-width: 315px;
        box-sizing: border-box;
        margin: 0px 0px 10px 0px;
    }
    .user-message {
        margin-left: auto;
        background-color: white;
        color: black;
        font-size: 16px;
        letter-spacing: -0.01em;
        line-height: 150%;
        overflow-wrap: break-word;
    }
    .other-message {
        background-color: #343434;
        color: white;
        font-size: 16px;
        letter-spacing: -0.01em;
        line-height: 150%;
        overflow-wrap: break-word;
    }
    .timestamp {
        display: block;
        margin: 8px 12px;
        font-size: 12px;
        color: black;
        text-align: right;
    }
    ul.chat-log {
        display: flex;
        flex-direction: column-reverse;
        overflow-y: auto;
        flex-grow: 1;
        padding-inline: 10px;
        width: 400px;
        height: 540px;
        max-width: 400px;
        border: 1px;
        border-color: black;
        border-style: solid;
        margin: 0px;
        background-color: #999999;
        list-style: none;
    }
</style>

<ul class="chat-log">
{#each chatLog as message}
    <li class="message-container {message.isUser ? 'user' : 'other'}">
        <span class="timestamp">
            {message.timestamp}
        </span>
        <div class="message {message.isUser ? 'user-message' : 'other-message'}">
            {message.text}
        </div>
    </li>
{/each}
</ul>