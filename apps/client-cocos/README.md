# Cocos Creator client preparation

This directory is a compile-tested integration layer, not a fabricated Cocos Creator project. Cocos Creator was not found on this computer.

After installing a trusted Cocos Creator 3.x release through the official Cocos Dashboard:

1. Create a TypeScript project in this directory or a temporary directory.
2. Preserve `src/network` and `src/platform` when merging the generated project.
3. Add `@riftbound/shared` as a local workspace dependency.
4. Let a root scene component own `CocosGameClient` and subscribe to room, game update, event, and error callbacks.
5. Render only `PlayerViewState`; never place `GameState` in the Cocos project.

The WeChat build must later supply a WeChat transport/platform adapter without adding `wx.*` to game-core or the server.
