// Type definitions for phenix-web-sdk 2022.0
// Project: https://github.com/PhenixRTS/WebSDK#readme
// Definitions by: Lucas Freitas <https://github.com/lucasff>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'phenix-web-sdk' {
  declare type ChannelObject = {
    authorized: boolean;
    autoMuted: boolean;
    autoPaused: boolean;
    clearBitrateLimit(): void;
    failureCount: number;
    loading: boolean;
    online: boolean;
    playing: boolean;
    rtcStats: any;
    setBitrateLimit(): void;
    standby: boolean;
    state: any;
    stopped: boolean;
    streamId: string;
    token: string;
    tokenExpiring: boolean;
    videoElement: HTMLVideoElement;
  };

  declare type ChannelOptions = {
    alias?: string;
    name: string;
    description?: string;
  };

  declare type RoomTypes =
    | 'DirectChat'
    | 'MultiPartyChat'
    | 'ModeratedChat'
    | 'TownHall'
    | 'Channel';

  declare type RoomOptions = {
    alias?: string;
    description?: string;
    name: string;
    type: RoomTypes;
  };

  declare type MemberRoles = 'Participant' | 'Audience' | 'Presenter' | 'Moderator';

  declare type MemberStates =
    | 'Active'
    | 'Passive'
    | 'HandRaised'
    | 'Inactive'
    | 'Offline';

  type StreamTypes = 'User' | 'Presentation' | 'Audio';

  type StreamingOptionsFeatures = 'real-time' | 'dash' | 'rtmp' | 'hls';

  declare interface ChatMessage {
    messageId: string;
    timestamp: number;
    from: any;
    message: string;
  }

  declare class AudioSpeakerDetector {
    constructor(userMediaStreams: any, options: any);

    dispose(): void;

    getAudioVolumeMeter(stream: any): any;

    getAudioVolumeMeters(): any;

    start(options: any, callback: any): void;

    stop(): void;

    toString(): any;
  }

  declare export class BandwidthMonitor {
    constructor(publishers: any, options: any);

    start(roomService: any, options: any): void;

    stop(): void;

    toString(): any;
  }

  declare export class PCast {
    constructor(options: any);

    getBaseUri(): any;

    getLogger(): any;

    getObservableSessionId(): any;

    getObservableStatus(): any;

    getProtocol(): any;

    getRemoteDescriptionSdp(streamId: any): any;

    getStatus(): any;

    getUserMedia(options: any, callback: any, onScreenShare: any): any;

    isStarted(): any;

    parseCapabilitiesFromToken(streamToken: string): any;

    parseRoomOrChannelAliasFromToken(streamToken: string): any;

    parseRoomOrChannelIdFromToken(streamToken: string): any;

    parseUriFromToken(streamToken: string): any;

    publish(
      streamToken: string,
      streamToPublish: any,
      callback: any,
      tags: any,
      options: any
    ): any;

    reAuthenticate(authToken: any): any;

    start(
      authToken: string,
      authenticationCallback: (pcast: any, status: 'ok' | 'unauthorized' | 'capacity' | 'network-available' | string, sessionId: string),
      onlineCallback: any,
      offlineCallback: any
    ): void;

    stop(reason: 'ended' | 'failed' | 'censored' | 'maintenance' | 'capacity' | 'app-background' | 'custom'): void;

    subscribe(streamToken: string, callback: any, options: any): any;

    toString(): any;
  }

  declare class RoomService {
    constructor(pcast: any);

    createRoom(room: any, callback: any): void;

    enterRoom(roomId: any, alias: any, callback: any): void;

    getChatService(): any;

    getObservableActiveRoom(): any;

    getRoomInfo(roomId: any, alias: any, callback: any): void;

    getSelf(): any;

    isInRoom(): any;

    leaveRoom(callback: any, isForceLeaveRoom: any): any;

    revertMemberChanges(member: any): any;

    revertRoomChanges(): any;

    setPCast(pcast: any): void;

    start(role: any, screenName: any): any;

    stop(reason: any): any;

    toString(): any;

    updateMember(member: any, callback: any): void;

    updateRoom(callback: any): void;

    updateSelf(callback: any): void;
  }

  declare class UserMediaResolver {
    constructor(pcast: any, options: any);

    getUserMedia(deviceOptions: MediaStreamConstraints, callback: any): void;

    getVendorSpecificConstraints(
      deviceOptions: any,
      resolution: any,
      frameRate: any
    ): any;
  }

  declare namespace RTC {
    class PhenixFlashVideo {
      constructor(ghost: any, stream: any, options: any);

      addEventListener(name: any, listener: any, useCapture: any): void;

      destroy(): void;

      getElement(): any;

      hookUpEvents(): any;

      onReady(callback: any): void;

      removeEventListener(name: any, listener: any, useCapture: any): void;
    }

    const RTCIceCandidate: any;

    const RTCPeerConnection: any;

    const RTCSessionDescription: any;

    const attachMediaStream: any;

    const browser: string;

    const browserVersion: string;

    const getDestinations: any;

    const getSources: any;

    const getStats: any;

    const getUserMedia: any;

    const reattachMediaStream: any;

    const webrtcSupported: boolean;

    function attachUriStream(element: any, streamUri: any): any;

    function exportGlobal(): void;

    function shim(): any;

    namespace global {
      class PhenixPCast {
        constructor(options: any);

        getBaseUri(): any;

        getLogger(): any;

        getObservableSessionId(): any;

        getObservableStatus(): any;

        getProtocol(): any;

        getRemoteDescriptionSdp(streamId: any): any;

        getStatus(): any;

        getUserMedia(options: any, callback: any, onScreenShare: any): any;

        isStarted(): any;

        parseCapabilitiesFromToken(streamToken: any): any;

        parseRoomOrChannelAliasFromToken(streamToken: any): any;

        parseRoomOrChannelIdFromToken(streamToken: any): any;

        parseUriFromToken(streamToken: any): any;

        publish(
          streamToken: any,
          streamToPublish: any,
          callback: any,
          tags: any,
          options: any
        ): any;

        reAuthenticate(authToken: any): any;

        start(
          authToken: any,
          authenticationCallback: any,
          onlineCallback: any,
          offlineCallback: any
        ): void;

        stop(reason: any): void;

        subscribe(streamToken: any, callback: any, options: any): any;

        toString(): any;
      }
    }
  }

  declare interface ChannelExpressOptions {
    features: ChannelExpressOptions[];
    adminApiProxyClient: object;
    onError?(): void;
    authToken?: string;
    pcastExpress?: symbol;
    treatBackgroundAsOffline?: boolean;
    reAuthenticateOnForeground?: boolean;
  }

  declare interface PCastExpressOptions {
    backendUri: string;
    authenticationData: string;
    onError?(): void;
    treatBackgroundAsOffline?: boolean;
    reAuthenticateOnForeground?: boolean;
  }

  /**
   *
   */
  declare class ChannelExpress {
    /**
     * @param {Object} options
     * @param {Object} [options.reconnectOptions={
     *   maxOfflineTime: 24 * 60 * 60 * 1000, // 1 day
     *   maxReconnectFrequency: 60 * 1000 // 60 seconds
     * }]
     */
    constructor(options: ChannelExpressOptions);

    createChannel(options: any, callback: any): void;

    dispose(): void;

    getPCastExpress(): any;

    getRoomExpress(): any;

    joinChannel(
      options: any,
      joinChannelCallback: any,
      subscriberCallback: any
    ): any;

    publishScreenToChannel(options: any, callback: any): void;

    publishToChannel(options: any, callback: any): void;
  }

  declare class PCastExpress {
    constructor(options: any);

    dispose(): void;

    getAdminAPI(): any;

    getPCast(): any;

    getPCastObservable(): any;

    getSessionIdObservable(): any;

    getUserMedia(options: any, callback: any): any;

    parseCapabilitiesFromToken(streamToken: any): any;

    parseRoomOrChannelAliasFromToken(streamToken: any): any;

    parseRoomOrChannelIdFromToken(streamToken: any): any;

    publish(options: any, callback: any): any;

    publishRemote(options: any, callback: any): any;

    publishScreen(options: any, callback: any): any;

    publishStreamToExternal(options: any, callback: any): any;

    subscribe(options: any, callback: any): any;

    subscribeToScreen(options: any, callback: any): any;

    toString(): any;

    waitForOnline(callback: any, isNotUserAction: any): any;
  }

  declare class RoomExpress {
    constructor(options: any);

    createRoom(options: any, callback: any): any;

    dispose(): void;

    getPCastExpress(): any;

    joinRoom(
      options: any,
      joinRoomCallback: any,
      membersChangedCallback: any
    ): any;

    publishScreenToRoom(options: any, callback: any): void;

    publishToRoom(options: any, callback: any): any;

    subscribeToMemberStream(
      memberStream: any,
      options: any,
      callback: any,
      defaultFeatureIndex: any
    ): any;
  }

  declare export namespace logging {
    class ConsoleAppender {
      constructor();

      getThreshold(): any;

      log(
        since: any,
        level: any,
        category: any,
        messages: any,
        sessionId: any,
        userId: any,
        environment: any,
        version: any,
        context: any
      ): void;

      setThreshold(level: any): void;
    }

    class Logger {
      constructor();

      addAppender(appender: any): void;

      debug(...args: any[]): any;

      error(...args: any[]): any;

      fatal(...args: any[]): any;

      getAppenders(): any;

      getApplicationVersion(): any;

      getEnvironment(): any;

      getObservableSessionId(): any;

      getUserId(): any;

      info(...args: any[]): any;

      setApplicationVersion(version: any): void;

      setEnvironment(environment: any): void;

      setObservableSessionId(observableSessionId: any): void;

      setUserId(userId: any): void;

      trace(...args: any[]): any;

      warn(...args: any[]): any;
    }

    const level: {
      DEBUG: number;
      ERROR: number;
      FATAL: number;
      INFO: number;
      TRACE: number;
      WARN: number;
    };

    function createLogger(): any;
  }

  export namespace lowLevel {
    class PCast {
      constructor(options: any);

      getBaseUri(): string;

      getLogger(): any;

      getObservableSessionId(): any;

      getObservableStatus(): any;

      getProtocol(): any;

      getRemoteDescriptionSdp(streamId: any): any;

      getStatus(): any;

      getUserMedia(options: any, callback: any, onScreenShare: any): any;

      isStarted(): boolean;

      parseCapabilitiesFromToken(streamToken: any): any;

      parseRoomOrChannelAliasFromToken(streamToken: any): any;

      parseRoomOrChannelIdFromToken(streamToken: any): any;

      parseUriFromToken(streamToken: any): any;

      publish(
        streamToken: string,
        streamToPublish: string | object,
        callback: () => void,
        tags: string[],
        options: object
      ): any;

      reAuthenticate(authToken: string): void;

      start(
        authToken: string,
        authenticationCallback: () => void,
        onlineCallback: () => void,
        offlineCallback: () => void
      ): void;

      stop(reason: any): void;

      subscribe(streamToken: any, callback: any, options: any): any;

      toString(): string;
    }

    class RoomService {
      constructor(pcast: any);

      createRoom(room: any, callback: any): void;

      enterRoom(roomId: any, alias: any, callback: any): void;

      getChatService(): any;

      getObservableActiveRoom(): any;

      getRoomInfo(roomId: any, alias: any, callback: any): void;

      getSelf(): any;

      isInRoom(): any;

      leaveRoom(callback: any, isForceLeaveRoom: any): any;

      revertMemberChanges(member: any): any;

      revertRoomChanges(): any;

      setPCast(pcast: any): void;

      start(role: any, screenName: any): any;

      stop(reason: any): any;

      toString(): any;

      updateMember(member: any, callback: any): void;

      updateRoom(callback: any): void;

      updateSelf(callback: any): void;
    }
  }

  export namespace media {
    class AudioSpeakerDetector {
      constructor(userMediaStreams: any, options: any);

      dispose(): void;

      getAudioVolumeMeter(stream: any): any;

      getAudioVolumeMeters(): any;

      start(options: any, callback: any): void;

      stop(): void;

      toString(): any;
    }

    class UserMediaResolver {
      constructor(pcast: any, options: any);

      getUserMedia(deviceOptions: MediaStreamConstraints, callback: any): void;

      getVendorSpecificConstraints(
        deviceOptions: any,
        resolution: any,
        frameRate: any
      ): any;
    }
  }

  export namespace net {
    class AdminApiProxyClient {
      constructor();

      createAuthenticationToken(callback: any): any;

      createStreamTokenForPublishing(
        sessionId: any,
        capabilities: any,
        callback: any
      ): any;

      createStreamTokenForPublishingToExternal(
        sessionId: any,
        capabilities: any,
        streamId: any,
        callback: any
      ): void;

      createStreamTokenForSubscribing(
        sessionId: any,
        capabilities: any,
        streamId: any,
        alternateStreamIds: any,
        callback: any
      ): any;

      /**
       * Dispose of all connections and clean up handlers.
       */
      dispose(): void;

      getAuthenticationData(): any;

      getAuthenticationDataLocationInPayload(): any;

      getBackendUri(): string;

      getEndpointPaths(): any;

      getRequestHandler(): any;

      setAuthenticationData(authenticationData: any): void;

      setAuthenticationDataLocationInPayload(
        authenticationDataLocationInPayload: any
      ): void;

      setBackendUri(backendUri: string): void;

      setEndpointPaths(endpointPaths: any): void;

      setRequestHandler(callback: any): void;

      toString(): any;
    }
  }

  export namespace utils {
    class BandwidthMonitor {
      constructor(publishers: any, options: any);

      start(roomService: any, options: any): void;

      stop(): void;

      toString(): any;
    }

    namespace logging {
      class ConsoleAppender {
        constructor();

        getThreshold(): any;

        log(
          since: any,
          level: any,
          category: any,
          messages: any,
          sessionId: any,
          userId: any,
          environment: any,
          version: any,
          context: any
        ): void;

        setThreshold(level: any): void;
      }

      class Logger {
        constructor();

        addAppender(appender: any): void;

        debug(...args: any[]): any;

        error(...args: any[]): any;

        fatal(...args: any[]): any;

        getAppenders(): any;

        getApplicationVersion(): any;

        getEnvironment(): any;

        getObservableSessionId(): any;

        getUserId(): any;

        info(...args: any[]): any;

        setApplicationVersion(version: any): void;

        setEnvironment(environment: any): void;

        setObservableSessionId(observableSessionId: any): void;

        setUserId(userId: any): void;

        trace(...args: any[]): any;

        warn(...args: any[]): any;
      }

      const level: {
        DEBUG: number;
        ERROR: number;
        FATAL: number;
        INFO: number;
        TRACE: number;
        WARN: number;
      };

      function createLogger(): any;
    }

    namespace rtc {
      class PhenixFlashVideo {
        constructor(ghost: any, stream: any, options: any);

        addEventListener(name: any, listener: any, useCapture: any): void;

        destroy(): void;

        getElement(): any;

        hookUpEvents(): any;

        onReady(callback: any): void;

        removeEventListener(name: any, listener: any, useCapture: any): void;
      }

      const RTCIceCandidate: any;

      const RTCPeerConnection: any;

      const RTCSessionDescription: any;

      const attachMediaStream: any;

      const browser: string;

      const browserVersion: string;

      const getDestinations: any;

      const getSources: any;

      const getStats: any;

      const getUserMedia: any;

      const reattachMediaStream: any;

      const webrtcSupported: boolean;

      function attachUriStream(element: any, streamUri: any): any;

      function exportGlobal(): void;

      function shim(): any;

      namespace global {
        class PhenixPCast {
          constructor(options: any);

          getBaseUri(): any;

          getLogger(): any;

          getObservableSessionId(): any;

          getObservableStatus(): any;

          getProtocol(): any;

          getRemoteDescriptionSdp(streamId: any): any;

          getStatus(): any;

          getUserMedia(options: any, callback: any, onScreenShare: any): any;

          isStarted(): any;

          parseCapabilitiesFromToken(streamToken: any): any;

          parseRoomOrChannelAliasFromToken(streamToken: any): any;

          parseRoomOrChannelIdFromToken(streamToken: any): any;

          parseUriFromToken(streamToken: any): any;

          publish(
            streamToken: any,
            streamToPublish: any,
            callback: any,
            tags: any,
            options: any
          ): any;

          reAuthenticate(authToken: any): any;

          start(
            authToken: any,
            authenticationCallback: any,
            onlineCallback: any,
            offlineCallback: any
          ): void;

          stop(reason: any): void;

          subscribe(streamToken: any, callback: any, options: any): any;

          toString(): any;
        }
      }
    }
  }
}

