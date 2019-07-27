# x32-fuzzer

> The Behringer X32 digital mixer has a rare crash bug. Let's find it.

## Motivation

The Behringer X32 is a very powerful and surprisingly affordable digital mixer. It's what GDQ uses for all of our shows.

This mixer also can also be controlled over the network via its OSC protocol. This is where the bug lies. There is some kind of race condition or resource contention which can cause the mixer to freeze, requiring a power cycle to restore normal operation.

The goal of this repo is to build a fuzzer which can automatically discover a repro for this crash/freeze bug.
