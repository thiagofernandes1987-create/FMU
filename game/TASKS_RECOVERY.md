# M28/M29/M30 recovery and GitHub sync

- [x] Verify all three ZIP CRC/SHA256 and extract without path traversal.
- [x] M28: 569 tests PASS.
- [x] M29: 612 tests PASS.
- [x] M30: 46 tests PASS.
- [x] Recover the M29 Git bundle (1,032 source tree entries match zip).
- [x] Merge M30 source and tests without deleting M29 original modules.
- [x] Implement M29+M30 adapter with real World codec and journal.
- [x] Test rollback, persistence, pause and validation in integrated suite (663/663 PASS).
- [ ] Verify and publish source to a new GitHub branch, preserving the current main.
- [ ] Verify GitHub checks, then merge after source integrity and QA pass.
- [ ] Import actual FMU_Database data only when an authorized real dataset is supplied.

Full gameplay parity remains blocked by the missing Rust engine and original golden fixtures.
