const Web3 = require('web3')
const inquirer = require('inquirer')
const fs = require('fs');
web3 = new Web3("http://localhost:8545")

listOfCandidates = ['Rama', 'Nick', 'Jose']

async function deployContract() {
  console.log('Deploying contract')
  web3.eth.getAccounts(console.log)
  abi = JSON.parse(fs.readFileSync('voting_sol_Voting.abi').toString())
  bytecode = fs.readFileSync('voting_sol_Voting.bin').toString()
  deployedContract = web3.eth.Contract(abi)
  deployedContract.options.data = bytecode;
  deployedContract.deploy({
    arguments: [listOfCandidates.map(name => web3.utils.asciiToHex(name))]
  }).send({
    from: '0x302c8b1f4b86fdaf26f7a7aa3481ee84e99a8057',
    gas: 1500000,
    gasPrice: web3.utils.toWei('0.00003', 'ether')
  }).then((newContractInstance) => {
    console.log(newContractInstance.options.address)
  });
}

function voteForCandidate(candidateName) {
  account = web3.eth.accounts[0]
  console.log(candidateName);
  contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({ from: account }).then((f) => {
    candidates[candidateName];
    contract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call().then((totalVote) => {
      console.log(`candidate Name ${candidateName} total vote ${totalVote}`)
    })
  })
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
      voteForCandidate(candidateName)
      break;
    }
  }
}

main()

