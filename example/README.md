# Phenix Web SDK examples

To run Phenix Web SDK examples from the main folder, run the following commands:
```
npm install
npm run bundle
npm run start
```
You can access examples using this pattern: `https://localhost:8888/<exampleName>.html`
Most examples have fields that need to be set up to start running. You can do it on the example page.
Or pass data for the fields as a query parameter `https://localhost:8888/Channel.html?token=<edgeAuthToken>`

## Tokens

Here are some pre-generated tokens to use with the local environment:

### Channel tokens
#### EdgeToken
```
DIGEST:eyJhcHBsaWNhdGlvbklkIjoidGVzdCIsImRpZ2VzdCI6ImxlU29mcW1KRldKVllCZkRuNGt0cnQzZ0NERlF4S1ZKY3hVV3dIdzh3VEQrN01SWFQ0a052RmN1Vi9lWlBXcUEwZGltUlZ0b0lpR3NhdTZsQ0JtUmdnPT0iLCJ0b2tlbiI6IntcInVyaVwiOlwiaHR0cHM6Ly9sb2NhbC5waGVuaXhydHMuY29tOjg0NDNcIixcImV4cGlyZXNcIjoxOTg1OTYyNTQ4NTcxLFwicmVxdWlyZWRUYWdcIjpcImNoYW5uZWxBbGlhczpjaGFubmVsXCJ9In0=
```

### Token (for publishing)
```
DIGEST:eyJhcHBsaWNhdGlvbklkIjoidGVzdCIsImRpZ2VzdCI6Ik5VckdRcFo0VkJxSWJJNkcyaGtpYm9kOXJ2Ulo2WWZOb3pFTHREdUZKNmk4YUNsQVF0YWgxcG1vbmQ4cFJOVTY4VG1wNGZ5YlFidzdPdW1BUjJwYTNnPT0iLCJ0b2tlbiI6IntcInVyaVwiOlwiaHR0cHM6Ly9sb2NhbC5waGVuaXhydHMuY29tOjg0NDNcIixcImV4cGlyZXNcIjoxOTg1OTYyNTkzMDE5LFwidHlwZVwiOlwicHVibGlzaFwiLFwicmVxdWlyZWRUYWdcIjpcImNoYW5uZWxBbGlhczpjaGFubmVsXCJ9In0=
```

### Room tokens
#### EdgeToken
```
DIGEST:eyJhcHBsaWNhdGlvbklkIjoidGVzdCIsImRpZ2VzdCI6IkxiRFZBbXQrNHltZkxXbWVTOVFydXdQR2dJbmErV1lJaDF4RzZydzFONUxaQmdHNmtnSlZHNUJFNDllSWx3N1hGTk5mNVdNNG40SW8wdHYzRVZhZjVnPT0iLCJ0b2tlbiI6IntcInVyaVwiOlwiaHR0cHM6Ly9sb2NhbC5waGVuaXhydHMuY29tOjg0NDNcIixcImV4cGlyZXNcIjoxOTg1OTYyODAwMDE5LFwicmVxdWlyZWRUYWdcIjpcInJvb21BbGlhczpyb29tXCJ9In0=
```

### Token (for publishing)
```
DIGEST:eyJhcHBsaWNhdGlvbklkIjoidGVzdCIsImRpZ2VzdCI6Ik92ckg1Zmw0c1pwbmFFTnlJYjYvenRDbkJtQ0hFRGJkbjdIejlXaVlrVGxFcXdtLzhqZHhtMDhMTS8xaGhOMkpoSllzODBVM1JtMjJXVlJZUVBJVm5RPT0iLCJ0b2tlbiI6IntcInVyaVwiOlwiaHR0cHM6Ly9sb2NhbC5waGVuaXhydHMuY29tOjg0NDNcIixcImV4cGlyZXNcIjoxOTg1OTYyNzk2MjQyLFwidHlwZVwiOlwicHVibGlzaFwiLFwicmVxdWlyZWRUYWdcIjpcInJvb21BbGlhczpyb29tXCJ9In0=
```


## Generate tokens for staging or production:

To generate tokens, you need to clone [EdgeAuth repository](https://github.com/PhenixRTS/EdgeAuth).

Then run these commands:
```shell
cd EdgeAuth/node
npm install

node src/edgeAuth.js --applicationId <aplicationID> --secret <secret> --expiresInSeconds <expiresInSeconds> --channel <channelId> --uri <pcastUrlForEnvironment>
```

If you want to generate the token for a room:
```shell
node src/edgeAuth.js --applicationId <aplicationID> --secret <secret> --expiresInSeconds <expiresInSeconds> --room <roomId> --uri <pcastUrlForEnvironment>
```

If you want it to be a publish token, add ``--publishingOnly`` to the command.
