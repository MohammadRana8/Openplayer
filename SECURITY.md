# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: (alpha) |

## Reporting a Vulnerability

We take the security of OpenPlayer seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT open a public issue**
2. Use GitHub's private [Security Advisory](https://github.com/openplayer-project/openplayer/security/advisories/new) form
   - Include: brief description, steps to reproduce, potential impact

### Response Timeline

This is a volunteer-run alpha project. We aim to acknowledge reports within a week and to fix confirmed issues as quickly as we can.

### What to Include

Please include the following information:
- Type of vulnerability (e.g., buffer overflow, XSS, privilege escalation)
- Full steps to reproduce
- Impact assessment
- Proof-of-concept code (if possible)
- Your contact information

### Security Measures

OpenPlayer implements the following security measures:

- **No networking code** — the app makes no network requests
- **Scoped media access** — music is read through MediaStore; no broad file-management permission
- **No third-party SDKs** — All code is open source or custom-built
- **No crash reporting** — Errors are logged locally only

## Bug Bounty

We do not offer monetary rewards, but valid security reports will be credited in our release notes (unless you prefer to remain anonymous).

## Responsible Disclosure

We follow the principles of responsible disclosure:
1. Report the vulnerability privately
2. We investigate and verify
3. We develop and test a fix
4. We coordinate a release date
5. We publicly disclose the vulnerability with the fix

Thank you for helping keep OpenPlayer secure!