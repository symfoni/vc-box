import {
	CredentialPayload,
	IIdentifier,
	PresentationPayload,
	VerifiableCredential,
} from "@veramo/core";
import { VCBox, VeramoAgent } from "./vc-box.js";

export class VCIssuer extends VCBox {
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		super(agent, identifier);
	}

	async createVC(_credential: CredentialPayload) {
		const credential: CredentialPayload = {
			...{
				issuer: this.identifier.did,
				type: ["VerifiableCredential"],
				"@context": ["https://www.w3.org/2018/credentials/v1"],
			},
			..._credential,
		};
		const vc = await this.agent.createVerifiableCredential({
			credential: {
				"@context": [
					"https://www.w3.org/2018/credentials/v1",
					"https://www.symfoni.dev/credentials/v1",
				],
				type: ["VerifiableCredential", "NorwegianIdNumber"],
				credentialSubject: credential,
				issuer: {
					id: this.identifier.did,
				},
			},
			proofFormat: "jwt",
		});
		return vc;
	}

	async createVP(
		_vcs: VerifiableCredential[],
		_presentation: Omit<PresentationPayload, "verifiableCredential">,
	) {
		const vcs = _vcs.map((vc) => {
			if (typeof vc === "object") {
				return vc.proof.jwt as string;
			}
			if (typeof vc === "string") {
				return vc;
			}
			throw Error(`Invalid VC type: ${typeof vc}`);
		});
		const presentation = {
			...{
				"@context": ["https://www.w3.org/2018/credentials/v1"],
				holder: this.identifier.did,
				verifiableCredential: vcs,
				type: ["VerifiablePresentation"],
			},
			..._presentation,
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
