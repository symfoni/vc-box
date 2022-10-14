import test from "ava";
import { ethers } from "ethers";
import { VCBox } from "../src/index.js";
import { config } from "dotenv";

test.before("load env", (t) => {
	const res = config();
	if (res.error) {
		t.log("Error loading env", res.error);
		t.fail();
	}
});

test("vcBox", async (t) => {
	t.log("process.env.mnemonic", process.env.mnemonic);
	const vcBox = await VCBox.init({
		dbName: "test",
		walletSecret: process.env.mnemonic!,
		chains: [
			{
				default: true,
				chainId: 31337,
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC!),
			},
		],
	});

	t.truthy(vcBox);
});
