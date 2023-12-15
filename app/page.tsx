'use client'
import Image from 'next/image'
import styles from './page.module.css'

import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, SafeEventEmitterProvider, IProvider } from "@web3auth/base";
import { useEffect, useState } from 'react';
// import RPC from "./web3RPC";
import { createWalletClient, custom, encodeFunctionData  } from "viem";
import { polygonMumbai } from "viem/chains";
import { WalletClientSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";

// import { createMagicSigner, magic } from "./magic";
// import { Magic } from "magic-sdk";
import { createMagicSigner, logoutMagic } from './magic';

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_fromTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_toTokenId",
        "type": "uint256"
      }
    ],
    "name": "BatchMetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "MetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "_xp",
        "type": "uint16"
      }
    ],
    "name": "gainXP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "newLevel",
        "type": "uint16"
      },
      {
        "components": [
          {
            "internalType": "uint16",
            "name": "health",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "speed",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "mind",
            "type": "uint16"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "sharpDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "bluntDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "burnDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "pierce",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "lethality",
                "type": "uint16"
              }
            ],
            "internalType": "struct GearFactory.OffensiveStats",
            "name": "offensiveStats",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "sharpResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "bluntResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "burnResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "guard",
                "type": "uint16"
              }
            ],
            "internalType": "struct GearFactory.DefensiveStats",
            "name": "defensiveStats",
            "type": "tuple"
          },
          {
            "internalType": "uint16",
            "name": "handling",
            "type": "uint16"
          }
        ],
        "internalType": "struct GearFactory.WeaponStats",
        "name": "upgradeStats",
        "type": "tuple"
      },
      {
        "internalType": "string[]",
        "name": "newAbilities",
        "type": "string[]"
      },
      {
        "internalType": "uint16",
        "name": "xpLeft",
        "type": "uint16"
      }
    ],
    "name": "levelUp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxWeaponsRequest",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "image",
            "type": "string"
          },
          {
            "internalType": "uint16",
            "name": "level",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "stage",
            "type": "uint16"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "health",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "speed",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "mind",
                "type": "uint16"
              },
              {
                "components": [
                  {
                    "internalType": "uint16",
                    "name": "sharpDamage",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "bluntDamage",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "burnDamage",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "pierce",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "lethality",
                    "type": "uint16"
                  }
                ],
                "internalType": "struct GearFactory.OffensiveStats",
                "name": "offensiveStats",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "internalType": "uint16",
                    "name": "sharpResistance",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "bluntResistance",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "burnResistance",
                    "type": "uint16"
                  },
                  {
                    "internalType": "uint16",
                    "name": "guard",
                    "type": "uint16"
                  }
                ],
                "internalType": "struct GearFactory.DefensiveStats",
                "name": "defensiveStats",
                "type": "tuple"
              },
              {
                "internalType": "uint16",
                "name": "handling",
                "type": "uint16"
              }
            ],
            "internalType": "struct GearFactory.WeaponStats",
            "name": "weaponStats",
            "type": "tuple"
          },
          {
            "internalType": "uint16",
            "name": "xp",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "identity",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "abilities",
            "type": "string[]"
          }
        ],
        "internalType": "struct GearFactory.Weapon",
        "name": "newWeapon",
        "type": "tuple"
      }
    ],
    "name": "requestWeapon",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxWeaponsRequest",
        "type": "uint256"
      }
    ],
    "name": "setWeaponsRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "weapons",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "image",
        "type": "string"
      },
      {
        "internalType": "uint16",
        "name": "level",
        "type": "uint16"
      },
      {
        "internalType": "uint16",
        "name": "stage",
        "type": "uint16"
      },
      {
        "components": [
          {
            "internalType": "uint16",
            "name": "health",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "speed",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "mind",
            "type": "uint16"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "sharpDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "bluntDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "burnDamage",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "pierce",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "lethality",
                "type": "uint16"
              }
            ],
            "internalType": "struct GearFactory.OffensiveStats",
            "name": "offensiveStats",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "uint16",
                "name": "sharpResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "bluntResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "burnResistance",
                "type": "uint16"
              },
              {
                "internalType": "uint16",
                "name": "guard",
                "type": "uint16"
              }
            ],
            "internalType": "struct GearFactory.DefensiveStats",
            "name": "defensiveStats",
            "type": "tuple"
          },
          {
            "internalType": "uint16",
            "name": "handling",
            "type": "uint16"
          }
        ],
        "internalType": "struct GearFactory.WeaponStats",
        "name": "weaponStats",
        "type": "tuple"
      },
      {
        "internalType": "uint16",
        "name": "xp",
        "type": "uint16"
      },
      {
        "internalType": "string",
        "name": "identity",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "weaponsRequested",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
const weapon = { name: "Basic Sword", description: "Little sword, perfect to train.", image: "https://gateway.pinata.cloud/ipfs/QmZCvC7CymLx5AZoHCNfH1HBAUULe9bZdWxEGZjT5riY95", level: 1, stage: 1, weaponStats: { health: 113, speed: 24, mind: 8, offensiveStats: { sharpDamage: 22, bluntDamage: 8, burnDamage: 13, pierce: 8, lethality: 17 }, defensiveStats: { sharpResistance: 21, bluntResistance: 8, burnResistance: 16, guard: 21, }, handling: 21, }, abilities: ["Ability1", "Ability2", "Ability3", "Ability4"], xp: 0, identity: "excalibur" };

const chain = polygonMumbai;
const GAS_MANAGER_POLICY_ID = "eb1e6203-5e19-42bf-a005-5b41fe3ec840";
const RPC_KEY = "xmRUAnX3GqNl962NVIensu3G1vAEHCs2";

export default function Home() {
  const [provider, setProvider] = useState<AlchemyProvider | null>(null);

  const login = async () => {
    try {
      const magicSigner = await createMagicSigner();
      console.log(magicSigner);
      if (!magicSigner) {
        console.log("Error while logging");
        return;
      }
      const aProvider = new AlchemyProvider({
        apiKey: RPC_KEY,
        chain,
      }).connect(
        (rpcClient) =>
          new LightSmartContractAccount({
            chain: rpcClient.chain,
            owner: magicSigner,
            factoryAddress: getDefaultLightAccountFactoryAddress(chain),
            rpcClient,
          })
      );
      if (!aProvider) {
        console.log("Error while creating Smart account");
        return;
      }
      console.log(aProvider);
      setProvider(aProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const sendSomething = async () => {
    if (!provider)
      return;
    provider.withAlchemyGasManager({
      policyId: GAS_MANAGER_POLICY_ID,
    });
    provider.getAddress().then((address: string) => console.log(address));
    const { hash } = await provider.sendUserOperation({
      target: "0x85CE50CcBc014bcEb3A9e72277efe9770AaC2Dac", // gearfight nft mumbai
      data: encodeFunctionData({
        abi: abi,
        functionName: "requestWeapon",
        args: [weapon]
      })
      // value: 0n, // value in bigint or leave undefined
    });
    const txHash = await provider.waitForUserOperationTransaction(hash);
    console.log(txHash);
  };

  const logout = async () => {
    if (!provider)
      return;
    provider.disconnect();
    await logoutMagic();
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    uiConsole({
      EOA: provider?.account?.getOwner() == undefined ? undefined : await provider?.account?.getOwner()?.getAddress(),
      smartAccount: await provider?.account?.getAddress()
    });
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={sendSomething} className="card">
            Send something
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>
    </main>
  )
}
