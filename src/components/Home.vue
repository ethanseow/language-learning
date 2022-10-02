<template>
    <button v-on:click="connect()">
        Join Room
    </button>
    <p>{{currentRoom}}</p>
    <p>
        Room Message:{{roomMessage}}
    </p>
    <p>
        Error Message:{{errorMessage}}
    </p>
    <button v-on:click="sendData()">
        Send data
    </button>
</template>

<script setup lang="ts">
// Globalize the socketio instance vuex
import { ref,reactive } from "vue";
import { io, Socket } from "socket.io-client"
import { socketRoutes,testData }  from '../utils'
const roomMessage = ref("No messages")
const errorMessage = ref("No errors")
const url = 'http://localhost:80/chat'
const currentRoom = ref("-1")
let socket : Socket;
let sendData = () => {
    if(socket == null){ errorMessage.value="Cannot send data without joining a room" } 
    errorMessage.value = "No errors"
    const data : testData = {
        message:"hello world"
    }
    socket.emit(socketRoutes.sendTestData,data)
}
const connect = () => {
    // exposing issue, what if we need to expose socket to other methods?
    socket = io(url)
    socket.io.on('open',()=>{
        socket.io.engine.transport.on("pollComplete", () => {
            const request = socket.io.engine.transport.pollXhr.xhr;
            document.cookie = request.getResponseHeader("Set-Cookie");
        })
    })
    socket.on('connect',()=>{
        socket.emit(socketRoutes.joinRoom,(data : string)=>{
            currentRoom.value = data
            console.log(data)
        })
    })
    socket.on('connect_error',()=>{
        console.log(`${socket.id} has a socket connect error`)
    })

    socket.on(socketRoutes.sendTestData,(data : testData)=>{
        roomMessage.value = data.message
    })
}

</script>