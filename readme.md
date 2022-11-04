[![Lib test](https://github.com/symfoni/vc-tools/actions/workflows/test.yml/badge.svg)](https://github.com/symfoni/vc-tools/actions/workflows/test.yml)
![npm](https://img.shields.io/npm/dm/@symfoni/vc-tools)
![node-current (scoped)](https://img.shields.io/node/v/@symfoni/vc-tools)
# Welcome to Symfoni Verfiable Credentials tools.

A library for issuing and verifying verifiable credentials. Based on [Veramo](https://veramo.io/).


# Who uses @symfoni/vc-tools
...

# How It Works
...

# Useage

## VC Issuer

On Goerli
```ts
	const issuer = await VCIssuer.init({
		dbName: "test",
		walletSecret: "test test test test test test test test test test test junk",
		chains: [
			{
				default: true,
				chainId: 5,
				provider: {
					url: "https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_APP_KEY"
				},
			},
		],
	});

    const vc = await issuer.createVC({
		credentialSubject: {
			identityNumber: "123456789",
		},
	});

    const vp = await issuer.createVP({
		verifiableCredential: [vc],
	});
```

## VC Verifier
On Goerli
```ts
	const verifier = await VCVerifier.init({
		dbName: "test",
		walletSecret: "test test test test test test test test test test test junk",
		chains: [
			{
				default: true,
				chainId: 5,
				provider: {
					url: "https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_APP_KEY"
				},
			},
		],
	});

	const verifiedVC = await verifier.verifyVC({
		credential: vc.proof.jwt, // or just vc
	});

   	const verifiedVP = await verifier.verifyVP({
		presentation: vp,
		policies: {
			audience: false,
		},
	});
```
On a network without standard DIDRegistry
```ts
	const verifier = await VCVerifier.init({
		dbName: "test",
		walletSecret: "test test test test test test test test test test test junk",
		chains: [
			{
				default: true,
				chainId: 5,
                didRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Address to the DID Registry
		        provider: new ethers.providers.JsonRpcProvider("http://localhost:8545"), // can also just put provider: { url: "http://localhost:8545",}
			},
		],
	});

....
```

# Development

- Clone repo
- pnpm install
- copy .env.example to .env
- pnpm test