import {
	CredentialPayload,
	IIdentifier,
	PresentationPayload,
} from "@veramo/core";
import { VCBoxArgs } from "./types.js";
import { VCBox, VeramoAgent } from "./vc-box.js";

export class VCIssuer extends VCBox {
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		super(agent, identifier);
	}

	static async init(args: VCBoxArgs) {
		const { agent, identifier } = await super.setup(args);
		return new VCIssuer(agent, identifier);
	}

	async createVC(_credential: Partial<CredentialPayload>) {
		const credential: CredentialPayload = {
			...{
				issuer: this.identifier.did,
				type: ["VerifiableCredential"],
				"@context": ["https://www.w3.org/2018/credentials/v1"],
			},
			..._credential,
		};
		const vc = await this.agent.createVerifiableCredential({
			credential: credential,
			proofFormat: "jwt",
		});
		return vc;
	}

	async createVP(args: Partial<PresentationPayload>) {
		const presentation: PresentationPayload = {
			...{
				"@context": ["https://www.w3.org/2018/credentials/v1"],
				holder: this.identifier.did,
				type: ["VerifiablePresentation"],
			},
			...args,
		};
		const vp = await this.agent.createVerifiablePresentation({
			presentation,
			proofFormat: "jwt",
		});
		// this.agent.dataStoreSaveVerifiablePresentation({
		// 	verifiablePresentation: vp,
		// });
		return vp;
	}
}
