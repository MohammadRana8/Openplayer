# Releasing OpenPlayer

Releases are built by GitHub Actions (`.github/workflows/ci.yml`) when you push a tag that starts with `v`.

## One-time setup

1. Create a release keystore and keep it private (never commit it):

   ```bash
   keytool -genkeypair -v -keystore openplayer-release.keystore -alias openplayer \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add these repository secrets (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | `base64 -w0 openplayer-release.keystore` |
   | `ANDROID_KEYSTORE_PASSWORD` | keystore password |
   | `ANDROID_KEY_ALIAS` | `openplayer` |
   | `ANDROID_KEY_PASSWORD` | key password |

   Without these the workflow still builds an APK, but signs it with Expo's debug key and names it
   `openplayer-<version>-debugkey.apk`. Use that only for testing. Always sign with the same key, or users
   cannot update the app.

3. Run `npm install` locally once and commit `package-lock.json`, then CI uses `npm ci`.

## Cutting a release

1. Update `version` in `package.json` and `app.config.ts`, and bump `android.versionCode` in `app.config.ts`.
2. Move the `[Unreleased]` notes in `CHANGELOG.md` under the new version.
3. Commit, then tag and push:

   ```bash
   git tag v0.1.0
   git push origin main v0.1.0
   ```

4. The workflow runs typecheck, lint and tests, builds the APK, signs it, and creates a GitHub release with
   the APK and `SHA256SUMS.txt`. Versions starting with `v0.` are marked as pre-releases.

## Before the first release

- Install on a real Android device (and one on Android 13+) and check: permission prompt, scan, folder
  browsing, playback, playback with the screen off.
- Replace the `openplayer-project/openplayer` URLs in the README, `CHANGELOG.md`, `SECURITY.md`, `package.json`
  and `.publish/` with your real repository if it differs.

## Google Play and F-Droid

Not set up yet. The files under `.publish/` are drafts of store listings; review them before use. F-Droid needs a
build recipe that runs `npx expo prebuild` first, so `.publish/fdroid/OpenPlayer.yml` is only a starting point.
