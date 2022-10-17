import { IIdentifier, TKeyType } from "@veramo/core";

// Core interfaces
import {
	createAgent,
	ICredentialPlugin,
	IDataStore,
	IDataStoreORM,
	IDIDManager,
	IKeyManager,
	IMessageHandler,
	IResolver,
	TAgent,
} from "@veramo/core";

// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";

// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// Web did identity provider

// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";

// Storage plugin using TypeOrm

// TypeORM is installed with `@veramo/data-store`
import { CredentialPlugin, W3cMessageHandler } from "@veramo/credential-w3c";

// Message handlers
import { JwtMessageHandler } from "@veramo/did-jwt";
import { MessageHandler } from "@veramo/message-handler";

// browser storage
import {
	BrowserLocalStorageStore,
	DataStoreJson,
	DIDStoreJson,
	KeyStoreJson,
	PrivateKeyStoreJson,
	VeramoJsonStore,
} from "@veramo/data-store-json";
import { Chain, VCBoxArgs } from "./types.js";
import { namespace, walletFromSecret } from "./utils.js";
import { JsonFileStore } from "./veramo-json-file-store.js";

import ethrResolver from "ethr-did-resolver";
// import { getResolver } from "@symfoni/ethr-did-resolver";

export type AgentConfig = IDIDManager &
	IKeyManager &
	IDataStore &
	IDataStoreORM &
	IResolver &
	IMessageHandler &
	ICredentialPlugin;
export type VeramoAgent = TAgent<AgentConfig>;

export class VCBox {
	protected agent: VeramoAgent;
	protected identifier: IIdentifier;
	constructor(agent: VeramoAgent, identifier: IIdentifier) {
		this.agent = agent;
		this.identifier = identifier;
	}

	static async init(args: VCBoxArgs) {
		const defaultChain = args.chains.find((chain) => chain.default);
		if (!defaultChain) {
			throw Error("No default chain provided, one chain must be default");
		}
		const store = await VCBox.getStore(args.dbName);
		const config = await VCBox.veramoConfig({
			store,
			chains: args.chains,
			storeEncryptKey: args.storeEncryptKey,
		});
		const agent = createAgent<AgentConfig>(config);
		const identifier = await VCBox.identityFromSecret(
			agent,
			args.walletSecret,
			defaultChain,
			{ alias: args.walletAlias },
		);
		return new VCBox(agent, identifier);
	}

	private static async getStore(dbName: string) {
		if (global["window"] !== undefined && global.window.localStorage) {
			return BrowserLocalStorageStore.fromLocalStorage(dbName);
		} else {
			return await JsonFileStore.fromFile(`${dbName}.json`);
		}
	}

	private static async identityFromSecret(
		agent: VeramoAgent,
		secret: string,
		defaultChain: Chain,
		args: { alias?: string } = {},
	) {
		let wallet = walletFromSecret(secret);
		const privateKeyHex = wallet.privateKey.slice(2);
		const compressedPublicKey = wallet._signingKey().compressedPublicKey;
		const didId = `${namespace(defaultChain)}:${compressedPublicKey}`;
		const alias =
			args.alias || `Wallet: ${Math.floor(Math.random() * 9999999) + 1}`;
		try {
			const exsisitingIdentifier = await agent.didManagerGetByAlias({
				alias: alias,
			});
			return exsisitingIdentifier;
		} catch (_error) {
			console.log("Creating new DID", didId, "with alias", alias);
			return await agent.didManagerImport({
				keys: [
					{
						privateKeyHex: privateKeyHex,
						type: <TKeyType>"Secp256k1",
						kms: "local",
						kid: compressedPublicKey,
					},
				],
				did: didId,
				controllerKeyId: compressedPublicKey,
				alias: alias,
				provider: namespace(defaultChain),
			});
		}
	}

	private static async veramoConfig(args: {
		store: VeramoJsonStore;
		chains: Chain[];
		storeEncryptKey?: string;
	}) {
		const { storeEncryptKey, chains, store } = args;

		const DEFAULT_CHAIN = chains.find((chain) => chain.default);
		if (!DEFAULT_CHAIN) {
			throw Error("No default chain provided, one chain must be default");
		}

		const didResolver = await import("@symfoni/did-resolver");
		// const ethrResolver = await import("ethr-did-resolver");

		return {
			plugins: [
				new KeyManager({
					store: new KeyStoreJson(store),
					kms: {
						local: new KeyManagementSystem(
							new PrivateKeyStoreJson(
								store,
								storeEncryptKey ? new SecretBox(storeEncryptKey) : undefined,
							),
						),
					},
				}),
				new DIDManager({
					store: new DIDStoreJson(store),
					defaultProvider: namespace(DEFAULT_CHAIN),
					providers: chains.reduce((object, chain) => {
						return {
							...object,
							[namespace(chain)]: new EthrDIDProvider({
								defaultKms: "local",
								networks: [
									{
										provider: chain.provider,
										chainId: chain.chainId,
										registry: chain.didRegistry,
									},
								],
							}),
						};
					}, {}),
				}),
				new DataStoreJson(store),
				new MessageHandler({
					messageHandlers: [new W3cMessageHandler(), new JwtMessageHandler()],
				}),
				new DIDResolverPlugin({
					resolver: new didResolver.Resolver({
						...ethrResolver.getResolver({
							networks: chains.map((chain) => ({
								chainId: chain.chainId,
								provider: chain.provider,
								registry: chain.didRegistry,
							})),
						}),
					}),
				}),
				new CredentialPlugin(),
			],
		};
	}
}
