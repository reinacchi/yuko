## Additions

- Add `Guild#ownerID` (7463102)
- Add `Permission` (678a7f4, f21617d)
- Add `Client#editGuild` and `Guild#edit` (7e54544)

## Breaking Changes

## Fixes

- Fixed Gateway connection handling (8015752, 6db85e9)
    - Now your bot will auto reconnect to the gateway
- `ClientOptions#intents` is now optional (76fdc02)

## Removes

- Removed `Guild#region` (ccdc422)

---

# Upcoming Features

**0.2** updates will be mostly major bugfixing and covers some of the Discord API. Interaction, threads, Guild Events, etc will be release together in **0.3** updates. I'll try to work on new features as soon as possible!