import test from "ava";
import { ethers } from "ethers";
import { VCBox } from "../src/index.js";
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

test("nodejs JsonRpcProvider", async (t) => {
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
test("nodejs string provider", async (t) => {
	const vcBox = await VCBox.init({
		dbName: "test",
		walletSecret: process.env.MNEMONIC!,
		chains: [
			{
				default: true,
				chainId: 31337,
				provider: { url: process.env.RPC as string },
			},
		],
	});

	t.truthy(vcBox);
});
