# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-simulator-com@0.2.1...@prismicio/slice-simulator-com@0.3.0) (2022-01-28)


### ⚠ BREAKING CHANGES

* **core:** core rewrite for maintainability (#7)

### Features

* **com:** also expose api when debug mode is enabled on simulator api ([4079eec](https://github.com/prismicio/slice-simulator/commit/4079eec976b1e18541a6180edceaafacc209abea))


### Refactor

* **core:** core rewrite for maintainability ([#7](https://github.com/prismicio/slice-simulator/issues/7)) ([c89f56f](https://github.com/prismicio/slice-simulator/commit/c89f56fe012984ebea742740c632d84221283273))


### Chore

* **deps:** maintain dependencies ([96c48d3](https://github.com/prismicio/slice-simulator/commit/96c48d3611419290fae0e6900a7e9b2c5d18e5dc))

### [0.2.1](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-simulator-com@0.2.0...@prismicio/slice-simulator-com@0.2.1) (2022-01-25)


### Features

* **com:** allow enabling debug mode through url query params ([df421d9](https://github.com/prismicio/slice-simulator/commit/df421d930362ed5cce92babf5d96b4c11984c92a))

## [0.2.0](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.1.1...@prismicio/slice-simulator-com@0.2.0) (2022-01-17)


### ⚠ BREAKING CHANGES

* rename project from `slice-canvas` to `slice-simulator`

### Refactor

* rename project from `slice-canvas` to `slice-simulator` ([0749a55](https://github.com/prismicio/slice-simulator/commit/0749a55dcd7a7088a86cf47ef43079f21303f266))

### [0.1.1](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.1.0...@prismicio/slice-canvas-com@0.1.1) (2022-01-14)


### Features

* **com,core,local-controller:** support `scrollToSlice` method ([992d68e](https://github.com/prismicio/slice-simulator/commit/992d68ed28b4f4c743be9883164d7c393423f231))


### Chore

* **deps:** configure size limit ([7dcb4f1](https://github.com/prismicio/slice-simulator/commit/7dcb4f1cec753fe1b0361f361958e318a721e47e))
* **deps:** maintain dependencies ([8f5b9f9](https://github.com/prismicio/slice-simulator/commit/8f5b9f969b01bb4b4d6adf65ac957cb66dac9b4c))


### Refactor

* return 501 not implemented when request handler is not found ([552254e](https://github.com/prismicio/slice-simulator/commit/552254eca344567cab13b05b1c208124d7847968))

## [0.1.0](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.6...@prismicio/slice-canvas-com@0.1.0) (2022-01-06)


### ⚠ BREAKING CHANGES

* **com:** share active slice information

### Features

* **com:** share active slice information ([9590f8d](https://github.com/prismicio/slice-simulator/commit/9590f8d84ab521e95e94948b1c6278dc991b0bef))

### [0.0.6](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.5...@prismicio/slice-canvas-com@0.0.6) (2021-12-03)


### Bug Fixes

* **com:** aknowledge ready only after connection ([b937886](https://github.com/prismicio/slice-simulator/commit/b937886e652a5d218bcc5da88402707bfb34a011))
* **com:** type error ([575947a](https://github.com/prismicio/slice-simulator/commit/575947a588f01a301404fb92129fa8acce0ca2c4))


### Chore

* **deps:** maintain dependencies ([602c7f6](https://github.com/prismicio/slice-simulator/commit/602c7f66291c432ae8c08f8291fc1c274446b411))


### Refactor

* centralize core API to avoid duplication ([c5be8d5](https://github.com/prismicio/slice-simulator/commit/c5be8d5e3b381bd925a7004739387a7664d72dd5))

### [0.0.5](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.4...@prismicio/slice-canvas-com@0.0.5) (2021-11-29)


### Refactor

* **com:** allow only setting debug to true to log all messages ([a0dd76a](https://github.com/prismicio/slice-simulator/commit/a0dd76a4cbc3a373dc063172a5a05159a9e3136d))
* **com:** enforce full API implementation on cores ([e225579](https://github.com/prismicio/slice-simulator/commit/e2255799869bb750bfbface7858f9db393acaef7))


### Chore

* **deps:** update dependencies ([742ce06](https://github.com/prismicio/slice-simulator/commit/742ce06b281bbaf018c2d2e33420b9a0f9f135da))

### [0.0.4](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.3...@prismicio/slice-canvas-com@0.0.4) (2021-11-16)


### Chore

* **deps:** maintain dependencies ([cf3b008](https://github.com/prismicio/slice-simulator/commit/cf3b008dbb015295d7ad905ca641dc62f7508260))

### [0.0.3](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.2...@prismicio/slice-canvas-com@0.0.3) (2021-11-10)


### Features

* **com:** expose a "connected" method ([4cda8b3](https://github.com/prismicio/slice-simulator/commit/4cda8b31243fe552f8aea109eef2adf677368c07))


### Chore

* **com:** typo ([923f88c](https://github.com/prismicio/slice-simulator/commit/923f88cba59075a4029436cfec72c627000c447b))


### Documentation

* **com:** missing comment ([6bb1f07](https://github.com/prismicio/slice-simulator/commit/6bb1f075c783884f02de965d12cbb472987a1541))
* create READMEs ([52f86a5](https://github.com/prismicio/slice-simulator/commit/52f86a57eea2e0143514591e9b969ec193d701b8))


### Refactor

* **com:** create message channel later to allow multiple connect to race ([3bda0e4](https://github.com/prismicio/slice-simulator/commit/3bda0e49fd5d3f5ed844534d50c4eab7bcddf49b))
* **com:** throw response errors through an error class ([c1ba556](https://github.com/prismicio/slice-simulator/commit/c1ba5561c81ba49851700c46a632856be54c152e))

### [0.0.2](https://github.com/prismicio/slice-simulator/compare/@prismicio/slice-canvas-com@0.0.1...@prismicio/slice-canvas-com@0.0.2) (2021-11-02)


### Features

* **com:** add debug mod to core API ([edcfd11](https://github.com/prismicio/slice-simulator/commit/edcfd112cc5c44402391c756c4ab80a3be25d54b))
* **com:** make options optional ([9bafadf](https://github.com/prismicio/slice-simulator/commit/9bafadf9057356fad870873b36cd75612ff09796))

### 0.0.1 (2021-11-02)


### Features

* **com:** setup com ([c6e5536](https://github.com/prismicio/slice-simulator/commit/c6e5536f35c2deae13707054a79b1cfb72b59074))


### Refactor

* **com:** allow null value for channel port ([ad9c55d](https://github.com/prismicio/slice-simulator/commit/ad9c55dc6de0c7893cbc6fcf827b0c82eef48825))
* **com:** improve com channel api usage ([1f8dad6](https://github.com/prismicio/slice-simulator/commit/1f8dad61b37591f8ac65f28dfcd584127fb67a76))
* **com:** improve handshake to be more resilient ([faed363](https://github.com/prismicio/slice-simulator/commit/faed363fef0ca6ca84da0cf346f56b3e21aaf02b))
* **com:** improve reusability and typing on message channel ([dc79459](https://github.com/prismicio/slice-simulator/commit/dc79459c9c08900bcca8ad2b4319cf6dbd7b9b8c))
