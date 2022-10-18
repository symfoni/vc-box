import {
	IIdentifier,
	IVerifyCredentialArgs,
	IVerifyPresentationArgs,
	IVerifyResult,
} from "@veramo/core";
import { VCBoxArgs } from "./types.js";
import { VCBox, VeramoAgent } from "./vc-box.js";

export class VCVerifier extends VCBox {
	constructor(agent: VeramoAgent, identifier: IIdentifier, dbName: string) {
		super(agent, identifier, dbName);
	}

	static async init(args: VCBoxArgs) {
		const { agent, identifier } = await super.setup(args);
		return new VCVerifier(agent, identifier, args.dbName);
	}
	async verifyVP(args: IVerifyPresentationArgs): Promise<IVerifyResult> {
		return this.agent.verifyPresentation(args);
	}

	async verifyVC(args: IVerifyCredentialArgs): Promise<IVerifyResult> {
		return this.agent.verifyCredential(args);
	}
}
