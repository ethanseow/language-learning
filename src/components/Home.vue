<template>
    <button v-on:click="connect()">
        Join Room
    </button>
</template>

<script setup lang="ts">
// Globalize the socketio instance vuex
import { ref } from "vue";
import { io, Socket } from "socket.io-client"
const url = 'http://localhost:80/chat'
const connect = () => {
    // exposing issue, what if we need to expose socket to other methods?
    const socket = io(url)
    socket.on('connect',()=>{
        console.log('connected')
    })
    socket.on('connect_error',()=>{
        console.log(`${socket.id} has a socket connect error`)
    })
}

</script>