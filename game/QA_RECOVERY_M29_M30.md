# Recovery QA — FMU M28/M29/M30

## Inputs and SHA-256

- M28: `FMU_Next_M28_Integrated_World_Transactions.zip` SHA-256 `f69ee04342bba13cf6d64b1616a5c0cb074ce6ff7330d05458f6381458c6f8fe` — CRC PASS, 569/569 tests.
- M29: `FMU_Next_M29_Transactional_World_Advance(1).zip` SHA-256 `e5edb8b884926eecd9516b34a78b2422274762dcf5b0fdf92991c81d0d9cc882` — CRC PASS, 612/612 tests, Git history 1,032 files matched source ZIP byte-for-byte.
- M30: `FMU_M30_Transaction_RNG_Standalone.zip` SHA-256 `4f22f07e3e4500a6c6d0dc0aa1883384c8deaed57e82a3246f690398d596020d` — CRC PASS, 46/46 tests.

## Integration

- Fully retained the M29 source tree; added standalone M30 code (`src/m30/`) and M30 tests (`tests/m30/`).
- Added M30→M29 adapter using `advanceWorldOneDay`, `encodeWorldDocument`, `loadBfnWorld` and M30 journal + deterministic RNG; no fictitious results.
- Checkpoint `World` `.bfn`, RNG state and effects are committed together using the M30 journal. Caller must still deduplicate externally delivered effects.
- New M29/M30 tests verify two-day proposal, physical `.bfn` round-trip, pause rollback, missing-engine rollback and invalid reference rejection.
- Combined test count: 612 + 46 + 5 = 663; the test runner explicitly includes nested M30 test folder.

## Current limitations

- The World engine remains callback-driven with substantial Rust parity gaps, the full FMU match loop is not implemented.
- No original full career `.bfn` fixture or differential Rust golden available.
- The restored code tree is from the user's uploaded archive, not a new functional implementation of the 20 unported Rust tests/examples.
- No player database records were added, deleted or transformed.
- No changes to the FMU Web UI in this integration. Visual QA not required for source-only change.

Status: **SOURCE_RECOVERED, COMBINED_TESTS_PASS, FULL_GAMEPLAY_PARITY_UNVERIFIED**.
