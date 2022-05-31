const Token = artifacts.require("DKPToken");
const DKP = artifacts.require("DKPContract");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Token)

	//assign token into variable to get it's address
	const token = await Token.deployed()
	
	//pass token address for dkp contract(for future minting)
	await deployer.deploy(DKP, token.address)

	//assign dBank contract into variable to get it's address
	const dkp = await DKP.deployed()

	//change token's owner/minter from deployer to dkp
	await token.passMinterRole(dkp.address)
};