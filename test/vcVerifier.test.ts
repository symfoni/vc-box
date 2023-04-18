import test from "ava";
import { config } from "dotenv";
import { ethers } from "ethers";
import { VCIssuer, VCVerifier } from "../src/index.js";
import { VCBoxArgs } from "../src/types.js";

test.before("load env", (t) => {
	if (process.env.CI) {
		t.pass("In test env");
	} else {
		const res = config();
		if (res.error) {
			t.log("Error loading env", res.error);
		}
	}
});

test("verify credential goerli", async (t) => {
	const SECRET = process.env.MNEMONIC;
	if (!SECRET) {
		t.fail("No mnemonic set");
		throw new Error("No mnemonic set");
	}
	const RPC_URL = process.env.RPC_URL;
	if (!RPC_URL) {
		t.fail("No RPC URL set");
		throw new Error("No RPC URL set");
	}
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: SECRET,
		chains: [
			{
				default: true,
				chainId: 421613,
				provider: new ethers.providers.JsonRpcProvider(RPC_URL),
				didRegistry: "0x8FFfcD6a85D29E9C33517aaf60b16FE4548f517E",
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
	const SECRET = process.env.MNEMONIC;
	if (!SECRET) {
		t.fail("No mnemonic set");
		throw new Error("No mnemonic set");
	}
	const RPC_URL = process.env.RPC_URL;
	if (!RPC_URL) {
		t.fail("No RPC URL set");
		throw new Error("No RPC URL set");
	}
	const args: Omit<VCBoxArgs, "dbName"> = {
		walletSecret: SECRET,
		chains: [
			{
				default: true,
				chainId: 421613,
				provider: new ethers.providers.JsonRpcProvider(RPC_URL),
				didRegistry: "0x8FFfcD6a85D29E9C33517aaf60b16FE4548f517E",
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
