const Web3 = require('web3')
const inquirer = require('inquirer')
const fs = require('fs');
web3 = new Web3("http://localhost:8545")

listOfCandidates = ['Rama', 'Nick', 'Jose']
abi = JSON.parse(fs.readFileSync('voting_sol_Voting.abi').toString())
bytecode = fs.readFileSync('voting_sol_Voting.bin').toString()
deployedContract = new web3.eth.Contract(abi)

async function deployContract() {
  console.log('Deploying contract', [listOfCandidates.map(name => web3.utils.asciiToHex(name))])
  web3.eth.getAccounts(console.log)
  deployedContract.options.data = bytecode;
  contract = await deployedContract.deploy({
    arguments: [listOfCandidates.map(name => web3.utils.asciiToHex(name))]
  }).send({
    from: "0x93a4f7C3E6BEFF298E7B21C2F0E151776AC2D255",
    gas: 1500000,
    gasPrice: web3.utils.toWei('0.00003', 'ether')
  })
  console.log('Contract deployed to:', contract.options.address);
  return contract;
}

async function voteForCandidate(candidateName) {
  account = await web3.eth.getAccounts();
  console.log(candidateName);
  deployedContract.options.address = "0xa2eeabbcadf2d994fabdfeb54ee16c112e83f6ed";

  let totalVote = await deployedContract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call()
  console.log(`candidate Name ${candidateName} total vote ${totalVote}`)
  let response = await deployedContract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({ from: account[5] })
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

