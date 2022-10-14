import { ethers } from "ethers";
import { Chain } from "./types.js";

export function checkForPrivateKey(
	secret: string,
): [true, string] | [false, undefined] {
	if (ethers.utils.isHexString(secret)) {
		if (secret.slice(0, 2).toLowerCase() === "0x".toLowerCase()) {
			return [true, secret.slice(2)];
		} else {
			return [true, secret];
		}
	}
	return [false, undefined];
}

export function checkForMenemonic(
	secret: string,
): [true, string] | [false, undefined] {
	if (secret.split(" ").length === 12) {
		return [true, secret];
	}
	return [false, undefined];
}

export function walletFromSecret(secret: string): ethers.Wallet {
	const [isPrivateKey, privateKey] = checkForPrivateKey(secret);
	if (isPrivateKey) {
		return new ethers.Wallet(privateKey);
	} else {
		const [isMenemonic, menemonic] = checkForMenemonic(secret);
		if (isMenemonic) {
			return ethers.Wallet.fromMnemonic(menemonic);
		}
	}
	throw new Error(
		"Secret is not a private key or menemonic, please provide a valid secret.",
	);
}

export function namespace(chain: Chain) {
	return `did:ethr:${chain.chainId}`;
}
