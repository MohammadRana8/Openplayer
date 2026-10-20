# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html). Versions below 1.0.0 are alpha.

## [Unreleased]

## [0.1.0] - Unreleased

First public alpha.

### Added
- Library scan through MediaStore: adds new files, updates existing ones, removes deleted ones
- Folder browsing and playback
- Player screen with play/pause, next/previous, repeat and shuffle
- Playback service: per-queue resume position, shuffle without repeats, sleep timer
- Versioned SQLite migrations (`PRAGMA user_version`)
- GitHub Actions: typecheck, lint, tests, and tag-triggered APK release

### Known limitations
- Tags are not read, so Artists/Albums/Genres are empty and songs show their file names
- Equalizer, pitch, gapless playback, lyrics, playlists, backup are not implemented
- No notification or lock-screen controls yet

[Unreleased]: https://github.com/openplayer-project/openplayer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/openplayer-project/openplayer/releases/tag/v0.1.0
