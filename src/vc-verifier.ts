import {
	IIdentifier,
	IVerifyCredentialArgs,
	IVerifyPresentationArgs,
} from "@veramo/core";
import { VCBox, VeramoAgent } from "./vc-box.js";

export class VCVerifier extends VCBox {
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		super(agent, identifier);
	}

	async verifyVP(args: IVerifyPresentationArgs) {
		return this.agent.verifyPresentation(args);
	}

	async verifyVC(args: IVerifyCredentialArgs) {
		return this.agent.verifyCredential(args);
	}
}
