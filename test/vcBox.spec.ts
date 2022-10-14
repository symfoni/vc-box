import test from "ava";
import { ethers } from "ethers";
import { VCBox } from "../src/index.js";
import { config } from "dotenv";

test.before("load env", (t) => {
	const res = config();
	t.log(res.parsed);
	t.log(res.error);
	t.log("Loaded env", process.env);
});

test("NodeJs", async (t) => {
	t.log("process.env.mnemonic", process.env.mnemonic);
	const vcBox = await VCBox.init({
		dbName: "test",
		walletSecret: process.env.mnemonic!,
		chains: [
			{
				default: true,
				chainId: 1,
				provider: new ethers.providers.JsonRpcProvider(process.env.RPC!),
			},
		],
	});

	t.truthy(vcBox);
});
