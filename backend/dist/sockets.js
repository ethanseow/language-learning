export var SocketEmits;
(function (SocketEmits) {
    SocketEmits["WAIT_FOR_ROOM"] = "waitForRoom";
    SocketEmits["JOIN_ROOM"] = "joinRoom";
    SocketEmits["PARTNER_JOINED"] = "partnerJoined";
    SocketEmits["EMIT_CANDIDATE"] = "emitCandidate";
    SocketEmits["EMIT_OFFER"] = "emitOffer";
    SocketEmits["EMIT_ANSWER"] = "emitAnswer";
    SocketEmits["PARTNER_DISCONNECTED"] = "partnerDisconnected";
    SocketEmits["GET_ALL_MESSAGES"] = "getAllMessages";
    SocketEmits["SEND_MESSAGE"] = "sendMessage";
    SocketEmits["SHARE_SCREEN"] = "shareScreen";
    SocketEmits["CREATED_ROOM"] = "createdRoom";
    SocketEmits["ASK_POLITENESS"] = "askPoliteness";
    SocketEmits["REJOIN_ROOM"] = "rejoinRoom";
})(SocketEmits || (SocketEmits = {}));
export var SocketNamespaces;
(function (SocketNamespaces) {
    SocketNamespaces["WEB_RTC"] = "/webRtc";
    SocketNamespaces["TEXT_CHAT"] = "/textChat";
})(SocketNamespaces || (SocketNamespaces = {}));
//# sourceMappingURL=sockets.js.map