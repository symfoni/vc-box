import test from "ava";
import { ethers } from "ethers";
import { VCIssuer } from "../src/index.js";
import { config } from "dotenv";

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
test("init with JsonRpcProvider", async (t) => {
	const vcBox = await VCIssuer.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: parseInt(process.env.CHAIN_ID!),
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC!),
				didRegistry: process.env.DID_REGISTRY
					? process.env.DID_REGISTRY
					: undefined,
			},
		],
	});

	t.truthy(vcBox);
});
test("init with string provider", async (t) => {
	const vcBox = await VCIssuer.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: parseInt(process.env.CHAIN_ID!),
				provider: { url: process.env.RPC as string },
				didRegistry: process.env.DID_REGISTRY
					? process.env.DID_REGISTRY
					: undefined,
			},
		],
	});

	t.truthy(vcBox);
});

test("issue credential", async (t) => {
	const issuer = await VCIssuer.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: parseInt(process.env.CHAIN_ID!),
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC!),
				didRegistry: process.env.DID_REGISTRY
					? process.env.DID_REGISTRY
					: undefined,
			},
		],
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

	t.truthy(vc["@context"].length === 2, "context should have two items");
	t.is(typeof vc.proof.jwt, "string", "proof should be a string");
});
