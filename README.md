# Phenix Web SDK

The Phenix Web SDK provides APIs that enable browsers to stream from and to Phenix PCast&trade;.

The SDK utilizes built-in WebRTC APIs and third party WebRTC plugins for browsers that do not natively support WebRTC to easily publish and view streams.


## PCast&trade; Workflow Example

```sh
npm install
npm start
```

Then goto the [workflow demo page](http://localhost:8888/) that allows you to connect to PCast&trade;.


## Real-time versus Live Streaming

Real-time streaming offers blazing fast video delivery with almost no end-to-end delay. Live streaming, in contrast, is much slower and typically comes with 12 or more seconds end-to-end delay.

Lowering the end-to-end latency ensures your content stays ahead of the Twittersphere and unlocks a truly interactive experience for your audience.

Please refer to the [PCast&trade; documentation](https://phenixp2p.com/docs) for instructions to setup real-time and live streaming sessions using the extremely scalable PCast&trade; platform.

The WebSDK supports native and third party WebRTC plugins for real-time streaming to browsers and Google's [Shaka Player](https://github.com/google/shaka-player) for live streaming. Please see the official [PCast&trade; documentation](https://phenixp2p.com/docs) for how to setup Shaka Player for use with the WebSDK.


## Roadmap

Upcoming: Support additional HLS and DASH players to view live streams
