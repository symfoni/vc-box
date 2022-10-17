import test from "ava";
import { ethers } from "ethers";
import { VCBox } from "../src/index.js";
import { config } from "dotenv";

test.before("load env", (t) => {
	if (process.env.NODE_ENV === "test") {
		t.pass("In test env");
	}
	const res = config();
	if (res.error) {
		t.log("Error loading env", res.error);
	}
});

test("vcBox", async (t) => {
	t.log("process.env.MNEMONIC", process.env.MNEMONIC);
	const vcBox = await VCBox.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
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
