const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

/**
 * Get proof array as hex strings of current wallet
 * @param walletAddress
 * @return {Promise<string[]>}
 */
export const getMerkleHexProof = async (walletAddress) => {
  let response = await fetch("../wl.json");
  let whitelistAddresses = await response.json();

  let leaves = whitelistAddresses.map((address) => keccak256(address));
  let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

  let leaf = keccak256(walletAddress);
  return merkleTree.getHexProof(leaf);
};

/**
 * Check if the wallet exists in the white list
 * @param walletAddress
 * @return {Promise<boolean>}
 */
export const checkWhiteListUser = async (walletAddress) => {
  let response = await fetch("../wl.json");
  let whitelistAddresses = await response.json();

  let leaves = whitelistAddresses.map((address) => keccak256(address));
  let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  let merkleRoot = merkleTree.getHexRoot();

  console.log("merkleRoot", merkleRoot);

  let leaf = keccak256(walletAddress);
  let hexProof = merkleTree.getHexProof(leaf);

  return merkleTree.verify(hexProof, leaf, merkleRoot);
};
