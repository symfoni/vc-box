// noinspection ES6PreferShortImport

import { IIdentifier, IMessage, ManagedKeyInfo } from "@veramo/core";
import {
	ClaimTableEntry,
	CredentialTableEntry,
	DiffCallback,
	PresentationTableEntry,
	VeramoJsonCache,
	VeramoJsonStore,
} from "@veramo/data-store-json";
import { ManagedPrivateKey } from "@veramo/key-manager";
import * as fs from "fs";
//   import { IIdentifier, IMessage, ManagedKeyInfo } from '../../packages/core/src'
//   import { ManagedPrivateKey } from '../../packages/key-manager/src'

/**
 * A utility class that shows how a File based JSON storage system could work.
 * This is not recommended for large databases since every write operation rewrites the entire database.
 */
export class JsonFileStore implements VeramoJsonStore {
	private filePath: fs.PathLike;
	notifyUpdate: DiffCallback;
	dids: Record<string, IIdentifier>;
	keys: Record<string, ManagedKeyInfo>;
	privateKeys: Record<string, ManagedPrivateKey>;
	credentials: Record<string, CredentialTableEntry>;
	claims: Record<string, ClaimTableEntry>;
	presentations: Record<string, PresentationTableEntry>;
	messages: Record<string, IMessage>;

	private constructor(filePath: fs.PathLike) {
		this.filePath = filePath;
		this.notifyUpdate = async (
			_oldState: VeramoJsonCache,
			newState: VeramoJsonCache,
		) => {
			await this.save(newState);
		};
		this.dids = {};
		this.keys = {};
		this.privateKeys = {};
		this.credentials = {};
		this.claims = {};
		this.presentations = {};
		this.messages = {};
	}

	public static async fromFile(file: fs.PathLike): Promise<JsonFileStore> {
		const store = new JsonFileStore(file);
		return await store.load();
	}

	private async load(): Promise<JsonFileStore> {
		await this.checkFile();
		const rawCache = await fs.promises.readFile(this.filePath, {
			encoding: "utf8",
		});
		let cache: VeramoJsonCache;
		try {
			cache = JSON.parse(rawCache);
		} catch (error: unknown) {
			console.log("Error parsing JSON file, busting cache.", error);
			cache = {};
		}
		({
			dids: this.dids,
			keys: this.keys,
			credentials: this.credentials,
			claims: this.claims,
			presentations: this.presentations,
			messages: this.messages,
			privateKeys: this.privateKeys,
		} = {
			dids: {},
			keys: {},
			credentials: {},
			claims: {},
			presentations: {},
			messages: {},
			privateKeys: {},
			...cache,
		});
		return this;
	}

	private async save(newState: VeramoJsonCache): Promise<void> {
		await fs.promises.writeFile(this.filePath, JSON.stringify(newState), {
			encoding: "utf8",
		});
	}

	private async checkFile() {
		const file = await fs.promises.open(this.filePath, "w+");
		await file.close();
	}
}
