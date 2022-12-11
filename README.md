# Hyperlane defi

![alt "flowchart"](/public/Hyperlane-Based-Swap.png)

## Overview

This is a project for hyperlane gitcoin hackathon.We build a project to help exchange tokens on different remote chains without deploying smart contract on remote chains.The swap process is based on uniswap v3 protocol.We get the pool address from the two choose tokens.After we get the pool address , we can get the exchange rate from the instance of pool.And then approval the allowance .Finnally we can make the swap.

### Links && address

- Front-end:<https://hyperlane-defi.vercel.app/>
- Youtube:<https://youtu.be/n3JMRN5-Wq4>
- InterchainAccount:0x3C951DEE860c6Da62B9D0A719B829Ed3825D1c34
- Bsc-test Contract:[0xA4BCB4bB1516C0F62A6CC7a60e2F6fAfd9821BD2](https://testnet.bscscan.com/address/0xA4BCB4bB1516C0F62A6CC7a60e2F6fAfd9821BD2)

### Why we build?

We build to help swap on different remote chains , so that user don't need to care about remote chains and user don't need to switch networks at the same time.

### Tech stack

- Next.js
- Tailwind CSS
- Solidity
- Hardhat
- Uniswap v3 Protocol

### Codes

#### 1.Solidity

![alt "solidity"](/public/carbon-1.png)

#### 2.Front-end

```shell
hyperlane-defi
├── components
├── contract ======================hardhat smart contracts
│   ├── artifacts
│   │   ├── @openzeppelin
│   │   ├── @uniswap
│   │   ├── build-info
│   │   └── contracts
│   ├── cache
│   ├── contracts
│   ├── scripts
│   └── test
├── pages  =======================front-end codes
│   └── api
├── public =======================final codes
│   ├── network
│   └── token
├── services
├── styles ========================css
└── utils  ========================utils
```

## Install

```shell
npm install
```

```shell
npm run dev
```

## Flowchart

![alt "flowchart"](/public/Hyperlane-Flowchart.jpg)

## Reference

- Hyperlane Docs:<https://docs.hyperlane.xyz/hyperlane-docs/introduction/readme>
- Uniswap V3 Docs:<https://docs.uniswap.org/sdk/v3/overview>
- Hardhat:<https://hardhat.org/>

## License

SPDX short identifier: MIT
