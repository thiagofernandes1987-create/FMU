# M29 + M30 consolidated recovery

Recovered from three user-supplied immutable archives M28, M29 and M30. No original archive was overwritten. The M29 historical Git bundle was cloned at its original HEAD; the M30 source and tests are added as an additive module under `src/m30/` and `tests/m30/`.

## Validation

- M28 baseline: **569/569** tests passed.
- M29 baseline: **612/612** tests passed.
- M30 standalone: **46/46** tests passed.
- Integrated M29+M30: **663/663** tests passed, including **5 integration tests** using the M29 World codec and the M30 crash-safe journal.

```bash
npm test
npm run m30:tests
npm run m27:audit
```

## Important limits

- M30's game advancement is an adapter for M29's callback-based World. It does not implement the missing original Rust match simulation.
- No `FMU_Database` live records were included. Nothing in this repository should be mistaken for an authoritative player data import.
- The signed source archives are preserved separately in the FMU Library backup dated 2026-11-06; GitHub includes source, not the 18MB proprietary-looking original WASM game binary.
- The original M29 Git bundle is included in the offline recovery archive and remains independently verifiable.
- The source-derived modules remain GPL-3.0-only. The public demo is under `public/fmu-m24` and should not be confused with the complete Rust manager.
