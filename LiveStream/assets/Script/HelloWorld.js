// Import the AgoraVideoRender cloud component.
const AgoraVideoRender = require('AgoraVideoRender');
cc.Class({
    extends: cc.Component,

    ctor(){
        this.joined = false;
    },

    properties: {
        label : cc.Label,
        target: {
            default: null,
            type: cc.Prefab
        },
        parent : cc.Node,
    },
    
    onLoad: function () {
        // Initialize the Agora engine. Replace YOUR_APPID with the App ID of your Agora project.
        agora.init('03fb15e4d24a430497b80294d17af14f');
        agora.on('joinChannelSuccess', this.onJoinChannelSuccess, this);
        agora.on('leaveChannel', this.onLeaveChannel, this);
        agora.on('userJoined', this.onUserJoined, this);
        agora.on('userOffline', this.onUserOffline, this);

        // Set the channel profile as interactive live streaming.
        agora.setChannelProfile(agora.CHANNEL_PROFILE_TYPE.CHANNEL_PROFILE_LIVE_BROADCASTING);

        // Enable the video module.
        agora.enableVideo();
        // Enable the audio.
        agora.enableAudio();
        // Start the local video preview.
        agora.startPreview();

        //agora.addInjectStreamUrl("https://www.youtube.com/watch?v=EV-91JV4Fws&list=RDEV-91JV4Fws&start_radio=1&ab_channel=Masew", new LiveInjectStreamConfig( { audioBitrate:400, audioChannels:1, audioSampleRate:44100, height:0, videoBitrate:400, videoFramerate: 15, videoGop:30, width:0 }));
    },


    setClientRole: function (toggle, customEventData) {
        // Set the client role. A user chooses a client role and the toggle component passes it through customEventData.
        // If the customEventData value is 1, the client role is set to audience, and the corresponding enumerator is agora
        cc.log(customEventData);
        // If the customEventData value is 2, the client role is set to host, and the corresponding enumerator is agora.CLIENT_ROLE_TYPE
        if(customEventData == 1){
            agora.setClientRole(agora.CLIENT_ROLE_TYPE.CLIENT_ROLE_AUDIENCE);
        }
        if(customEventData == 2){
            agora.setClientRole(agora.CLIENT_ROLE_TYPE.CLIENT_ROLE_BROADCASTER);
        }
    },

    clickButton: function () {
        if (this.joined) {
            this.leaveChannel();
        } else {
            this.joinChannel();
        }
    },

    joinChannel: function () {
        // Join a channel.
        // Replace YOUR_TOKEN with the token you generated.
        // Replace CHANNEL_NAME with the channel name that you use to generate the token.
        // Enter a user ID in uid.
        var date = new Date();
        var id = parseInt(date.getTime()%1000);
        cc.log("id "+id);
        agora.joinChannel('00603fb15e4d24a430497b80294d17af14fIABnQltBvM1IYfxcyVW5xJx7THF9pjJO0qr8yNtnYDghe68sD1MAAAAAEADJD5AXiqqAYQEAAQCJqoBh', 'live', '', id);
    },


    onJoinChannelSuccess: function (channel, uid, elapsed) {
        // After the user leaves the channel, the label of the button changes to Leave the channel.
        cc.log("channel "+channel+"  "+uid+"  "+elapsed);
        this.joined = true;
        this.label.string = 'Leave the channel';
    },

    onUserJoined: function (uid, elapsed) {
        if (this.remoteUid === undefined) {
            this.remoteUid = uid;
            // Add a Prefab.
            const render = cc.instantiate(this.target);
            // Set the uid of the AgoraVideoRender component to the uid of the remote host.
            render.getComponent(AgoraVideoRender).uid = this.remoteUid;
            // Add AgoraVideoRender component to the Scene
            this.parent.addChild(render, 0, `uid:${this.remoteUid}`);
            // Set the size of the remote video view.
            render.setContentSize(700, 394);
            // Set the position of the remote video view.
            render.setPosition(0, 0);
        }
    },

    onUserOffline: function (uid, reason) {
        if (this.remoteUid === uid) {
            // When a remote host leaves the channel, set the uid to undefined.
            this.parent.getChildByName(`uid:${this.remoteUid}`).destroy();
            this.remoteUid = undefined;
        }
    },

    leaveChannel: function () {
        // Leaves the channel.
        agora.leaveChannel();
        if (this.remoteUid !== undefined) {
            // Remove the remote video view.
            this.parent.getChildByName(`uid:${this.remoteUid}`).destroy();
            this.remoteUid = undefined;
        }
        // After the local user leaves the channel, the label of the button changes to Join a channel.
        this.joined = false;
        this.label.string = 'Join a channel';
        // Destroy the Agora engine.
        agora.release();
    },

    // Occur when the local user leaves the channel.
    onLeaveChannel: function (stats) {
    }
});
