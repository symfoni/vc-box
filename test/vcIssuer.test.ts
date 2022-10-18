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
test("issue credential", async (t) => {
	const issuer = await VCIssuer.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 5,
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC_GOERLI!),
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
