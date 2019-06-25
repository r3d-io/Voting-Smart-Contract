const Web3 = require('web3')
const inquirer = require('inquirer')
const fs = require('fs');
web3 = new Web3("http://localhost:8545")

bytecode = fs.readFileSync('voting_sol_Voting.bin').toString()
abi = JSON.parse(fs.readFileSync('voting_sol_Voting.abi').toString())
deployedContract = new web3.eth.Contract(abi)
listOfCandidates = ['Rama', 'Nick', 'Jose']

function deployContract() {
  deployedContract.deploy({
    data: bytecode,
    arguments: [listOfCandidates.map(name => web3.utils.asciiToHex(name))]
  }).send({
    from: '0x27c201c151483f6d1157bdc7da8ef9f35e7bd327',
    gas: 1500000,
    gasPrice: web3.eth.getGasPrice()
    // gasPrice: web3.utils.toWei('0.00003', 'ether')
  }).then((newContractInstance) => {
    deployedContract.options.address = newContractInstance.options.address
    console.log(newContractInstance.options.address)
  });
}

function voteForCandidate(candidateName) {
  account = "0xa52b3591cdef31daa4e247a185067f453d399436"
  console.log(candidateName);
  contract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({ from: account }).then((f) => {
    candidates[candidateName];
    contract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call().then((totalVote) => {
      console.log(`candidate Name ${candidateName} total vote ${totalVote}`)
    })
  })
}

async function  main() {
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