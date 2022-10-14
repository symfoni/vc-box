import { ethers } from "ethers";

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
	provider: ethers.providers.Provider;
};
