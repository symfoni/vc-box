import test from "ava";
import { config } from "dotenv";
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

test("verify credential", async (t) => {
	// console.log(process.env);
	const args: VCBoxArgs = {
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: parseInt(process.env.CHAIN_ID!),
				provider: {
					url: process.env.RPC as string,
				},
				didRegistry: process.env.DID_REGISTRY
					? process.env.DID_REGISTRY
					: undefined,
			},
		],
	};
	const issuer = await VCIssuer.init(args);
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

	const verifier = await VCVerifier.init(args);
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
});
