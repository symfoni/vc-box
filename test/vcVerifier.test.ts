import test from "ava";
import { config } from "dotenv";
import { ethers } from "ethers";
import { VCIssuer, VCVerifier } from "../src/index.js";
import { VCBoxArgs } from "../src/types.js";

test.before("load env", (t) => {
	t.log("LOL");
	if (process.env.CI) {
		t.pass("In test env");
	} else {
		const res = config();
		if (res.error) {
			t.log("Error loading env", res.error);
		}
	}
});

const LOCAL_PROVIDER_URL = "http://127.0.0.1:8545/";

test("verify credential hardhat", async (t) => {
	if (process.env.CI) {
		t.pass("Cant test local network in CI");
		return;
	}
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 31337,
				didRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
				provider: {
					url: LOCAL_PROVIDER_URL,
				},
			},
		],
	};
	const issuer = await VCIssuer.init({
		...args,
		dbName: `${t.title}-issuer`,
	});
	const vc = await issuer.createVC({
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
			"https://www.symfoni.dev/credentials/v1",
		],
		type: ["VerifiableCredential", "NorwegianIdNumber"],
		credentialSubject: {
			identityNumber: "123456789",
		},
	});

	const verifier = await VCVerifier.init({
		...args,
		dbName: `db-${t.title}-verifier`,
	});

	const verifyVC = await verifier.verifyVC({
		credential: vc.proof.jwt,
	});

	if (verifyVC.error) {
		t.log("Error verifying VC", verifyVC.error);
	}

	t.truthy(verifyVC.verified, "VC should be verified");
	t.is(verifyVC.error, undefined, "No error should be thrown");

	const vp = await issuer.createVP({
		verifiableCredential: [vc.proof.jwt],
	});
	const verifyVP = await verifier.verifyVP({
		presentation: vp.proof.jwt,
		policies: {
			audience: false,
		},
	});
	if (verifyVP.error) {
		t.log("Error verifying VP", verifyVP);
	}

	t.truthy(verifyVP.verified, "VP should be verified");
	t.is(verifyVP.error, undefined, "No error should be thrown");
	await issuer.removeStore();
	await verifier.removeStore();
});

test("verify credential hardhat with new provider", async (t) => {
	if (process.env.CI) {
		t.pass("Cant test local network in CI");
		return;
	}
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 31337,
				didRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
				provider: new ethers.providers.JsonRpcProvider(LOCAL_PROVIDER_URL),
			},
		],
	};
	const issuer = await VCIssuer.init({
		...args,
		dbName: `${t.title}-issuer`,
	});
	const vc = await issuer.createVC({
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
			"https://www.symfoni.dev/credentials/v1",
		],
		type: ["VerifiableCredential", "NorwegianIdNumber"],
		credentialSubject: {
			identityNumber: "123456789",
		},
	});

	const verifier = await VCVerifier.init({
		...args,
		dbName: `db-${t.title}-verifier`,
	});

	const verifyVC = await verifier.verifyVC({
		credential: vc.proof.jwt,
	});

	if (verifyVC.error) {
		t.log("Error verifying VC", verifyVC.error);
	}

	t.truthy(verifyVC.verified, "VC should be verified");
	t.is(verifyVC.error, undefined, "No error should be thrown");

	const vp = await issuer.createVP({
		verifiableCredential: [vc.proof.jwt],
	});
	const verifyVP = await verifier.verifyVP({
		presentation: vp.proof.jwt,
		policies: {
			audience: false,
		},
	});
	if (verifyVP.error) {
		t.log("Error verifying VP", verifyVP);
	}

	t.truthy(verifyVP.verified, "VP should be verified");
	t.is(verifyVP.error, undefined, "No error should be thrown");
	await issuer.removeStore();
	await verifier.removeStore();
});

test("verify credential goerli", async (t) => {
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 5,
				provider: {
					url: process.env.RPC_GOERLI!,
				},
			},
		],
	};
	const issuer = await VCIssuer.init({
		...args,
		dbName: `${t.title}-issuer`,
	});
	const vc = await issuer.createVC({
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
			"https://www.symfoni.dev/credentials/v1",
		],
		type: ["VerifiableCredential", "NorwegianIdNumber"],
		credentialSubject: {
			identityNumber: "123456789",
		},
	});

	const verifier = await VCVerifier.init({
		...args,
		dbName: `db-${t.title}-verifier`,
	});

	const verifyVC = await verifier.verifyVC({
		credential: vc.proof.jwt,
	});

	if (verifyVC.error) {
		t.log("Error verifying VC", verifyVC.error);
	}

	t.truthy(verifyVC.verified, "VC should be verified");
	t.is(verifyVC.error, undefined, "No error should be thrown");

	const vp = await issuer.createVP({
		verifiableCredential: [vc.proof.jwt],
	});
	const verifyVP = await verifier.verifyVP({
		presentation: vp.proof.jwt,
		policies: {
			audience: false,
		},
	});
	if (verifyVP.error) {
		t.log("Error verifying VP", verifyVP);
	}

	t.truthy(verifyVP.verified, "VP should be verified");
	t.is(verifyVP.error, undefined, "No error should be thrown");
	await issuer.removeStore();
	await verifier.removeStore();
});

test("verify credential goerli with new provider", async (t) => {
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 5,
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC_GOERLI!),
			},
		],
	};
	const issuer = await VCIssuer.init({
		...args,
		dbName: `${t.title}-issuer`,
	});
	const vc = await issuer.createVC({
		"@context": [
			"https://www.w3.org/2018/credentials/v1",
			"https://www.symfoni.dev/credentials/v1",
		],
		type: ["VerifiableCredential", "NorwegianIdNumber"],
		credentialSubject: {
			identityNumber: "123456789",
		},
	});

	const verifier = await VCVerifier.init({
		...args,
		dbName: `db-${t.title}-verifier`,
	});

	const verifyVC = await verifier.verifyVC({
		credential: vc.proof.jwt,
	});

	if (verifyVC.error) {
		t.log("Error verifying VC", verifyVC.error);
	}

	t.truthy(verifyVC.verified, "VC should be verified");
	t.is(verifyVC.error, undefined, "No error should be thrown");

	const vp = await issuer.createVP({
		verifiableCredential: [vc.proof.jwt],
	});
	const verifyVP = await verifier.verifyVP({
		presentation: vp.proof.jwt,
		policies: {
			audience: false,
		},
	});
	if (verifyVP.error) {
		t.log("Error verifying VP", verifyVP);
	}

	t.truthy(verifyVP.verified, "VP should be verified");
	t.is(verifyVP.error, undefined, "No error should be thrown");
	await issuer.removeStore();
	await verifier.removeStore();
});
