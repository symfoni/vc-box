import { IIdentifier } from "@veramo/core";
import { VCBox, VeramoAgent } from "./vc-box.js";

export class VCIssuer extends VCBox {
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		super(agent, identifier);
	}
}
