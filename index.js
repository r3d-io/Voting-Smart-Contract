const Web3 = require('web3');
const inquirer = require('inquirer');
const fs = require('fs');
const HDWalletProvider = require('truffle-hdwallet-provider');
const dotenv = require('dotenv');
dotenv.config();

const provider = new HDWalletProvider(
  process.env.MNEMONIC,
  'https://rinkeby.infura.io/v3/6d83b486e19548de928707c8336bf15b'
  );
web3 = new Web3(provider)

listOfCandidates = ['Rama', 'Nick', 'Jose']
abi = JSON.parse(fs.readFileSync('voting_sol_Voting.abi').toString())
bytecode = fs.readFileSync('voting_sol_Voting.bin').toString()
deployedContract = new web3.eth.Contract(abi)

async function deployContract() {
  account = await web3.eth.getAccounts();
  console.log('Deploying contract', [listOfCandidates.map(name => web3.utils.asciiToHex(name))])
  web3.eth.getAccounts(console.log)
  deployedContract.options.data = '0x' + bytecode;
  contract = await deployedContract.deploy({
    arguments: [listOfCandidates.map(name => web3.utils.asciiToHex(name))]
  }).send({
    from: account[0],
    gas: 1000000,
    // gasPrice: web3.utils.toWei('0.00003', 'ether')
  })
  console.log('Contract deployed to:', contract.options.address);
  return contract;
}

async function voteForCandidate(candidateName) {
  account = await web3.eth.getAccounts();
  console.log(candidateName);
  deployedContract.options.address = "0xC6fD13A2A1294e5b0302451e6C84fC69E771cec5";

  let totalVote = await deployedContract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call()
  console.log(`candidate Name ${candidateName} total vote ${totalVote}`)
  let response = await deployedContract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({ from: account[0] })
  totalVote = await deployedContract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call()
  console.log(response)
  console.log(`candidate Name ${candidateName} total vote after you ${totalVote}`)
}

async function main() {
  userInput = await inquirer.prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Which operation do you want to perform?',
      choices: ['Deploy contract', 'Vote'],
    },
  ])

  switch (userInput.options) {
    case "Deploy contract": {
      deployContract()
      break;
    }
    case "Vote": {
      userChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'candidate',
          message: 'Which candidate you want to vote?',
          choices: ['Rama', 'Nick', 'Jose']
        },
      ])
      candidateName = userChoice.candidate
      await voteForCandidate(candidateName)
      break;
    }
  }
}

main()

