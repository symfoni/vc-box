[![Lib test](https://github.com/symfoni/vc-tools/actions/workflows/test.yml/badge.svg)](https://github.com/symfoni/vc-tools/actions/workflows/test.yml)
![npm](https://img.shields.io/npm/dm/@symfoni/vc-tools)
![node-current (scoped)](https://img.shields.io/node/v/@symfoni/vc-tools)
# Welcome to Symfoni Verfiable Credentials tools.

A library for issuing and verifying verifiable credentials. Based on [Veramo](https://veramo.io/).


# Who uses @symfoni/vc-tools

## In experimental testing

* The Norwegian Central Bank

[CDBC - Central Bank Digital Currency](https://www.norges-bank.no/en/Research/Research-projects/Central-bank-digital-currency/) - 
with verifiable credentials (VC) used for authentication and KYC.
The authentication is done with IDporten and the VC is issued by a dummy Digdir agent (represented by the central bank).
The VC is sent to the user's wallet often called the Holder. The user presents the VC to their bank to have their wallet authenticated for use with the CDBC.
The source code for the CDBC will be released in Q2 2023.

* The Norwegian Business Registry (BR)

Uses Symfoni for Organizational Digital Identity ("ODI").
BR issues a Chairman of the board VC. Authentication is done with BankID. The user's wallet can then be used to sign documents on behalf of the company.

## In academia

* Bachelor thesis with NAV (Norwegian Labour and Welfare Administration) - Norwegian University of Science and Technology

TODO Add link to thesis, github, video and digi

# How It Works

Can be used by issuer, verifier and holder.

TODO Convert to focusing on VC Issuer. 

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