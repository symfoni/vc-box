import { ethers } from "ethers";
import { ConnectionInfo } from "ethers/lib/utils.js";

export type VCBoxArgs = {
	storeEncryptKey?: string;
	chains: Chain[];
	walletSecret: string;
	dbName: string;
	walletAlias?: string;
};

export type Chain = {
	default: boolean;
	chainId: number;
	didRegistry?: string;
	provider:
		| ethers.providers.Provider
		| { url: ConnectionInfo | string; network?: ethers.providers.Networkish };
};
