# x32-fuzzer [![Build Status](https://dev.azure.com/gamesdonequick/x32-fuzzer/_apis/build/status/GamesDoneQuick.x32-fuzzer?branchName=master)](https://dev.azure.com/gamesdonequick/x32-fuzzer/_build/latest?definitionId=3&branchName=master)

> The Behringer X32 digital mixer has a rare crash bug. Let's find it.

## Motivation

The Behringer X32 is a very powerful and surprisingly affordable digital mixer. It's what GDQ uses for all of our shows.

This mixer also can also be controlled over the network via its OSC protocol. This is where the bug lies. There is some kind of race condition or resource contention which can cause the mixer to freeze, requiring a power cycle to restore normal operation.

The goal of this repo is to build a fuzzer which can automatically discover a repro for this crash/freeze bug.

## Installation and Usage

1. [Install Node.js 8 or later (10 is recommended)](https://nodejs.org/en/).
2. Clone this repository:

    ```bash
    git clone https://github.com/GamesDoneQuick/x32-fuzzer.git
    ```

3. Install this project's dependencies:

    ```bash
    cd x32-fuzzer
    npm install
    ```

4. Configure the fuzzer by creating a `config.json` file in the `x32-fuzzer` directory. The only parameter you need is `mixerIp`, the rest are optional and documented [here](https://github.com/GamesDoneQuick/x32-fuzzer/blob/master/src/config.ts).

    ```json
    {
    	"mixerIp": "192.168.1.62"
    }
    ```

5. Run the fuzzer:

    ```bash
    # From the x32-fuzzer directory:
    npm start
    ```
	
## Findings

This fuzzer is now complete and can crash the NIC of an X32 in about 30 seconds or less. It does this by generating a random OSC packet, and then sending copies of that same packet over and over again, as fast as possible, from 9 different client sockets.

This means that the data being sent doesn't matter too much, and what matters more is the _volume_ of data being sent. Perhaps this indicates that the root issue is a race condition or memory leak.

You'll know when the crash has occurred because the mixer will stop responding to pings, and the fuzzer script will say that it has stopped receiving heartbeats. Additionally, you'll see an error like this on the X32's main display:

![img](https://i.imgur.com/s0hzH3H.jpg)
