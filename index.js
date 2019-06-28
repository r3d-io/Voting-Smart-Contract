const Web3 = require('web3');
const inquirer = require('inquirer');
const fs = require('fs');
const HDWalletProvider = require('truffle-hdwallet-provider');
const dotenv = require('dotenv');
const solc = require('solc')
var EthereumTx = require('ethereumjs-tx').Transaction;
dotenv.config();

let accounts = {
  address: process.env.ADDRESS,
  key: process.env.KEY
}

async function voteForCandidate(candidateName) {
  const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    'https://rinkeby.infura.io/v3/6d83b486e19548de928707c8336bf15b'
  );
  web3 = new Web3(provider)

  account = await web3.eth.getAccounts();
  console.log(candidateName);
  deployedContract.options.address = process.env.CONTRACT_ADDRESS;

  let totalVote = await deployedContract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call()
  console.log(`candidate Name ${candidateName} total vote ${totalVote}`)
  let response = await deployedContract.methods.voteForCandidate(web3.utils.asciiToHex(candidateName)).send({ from: account[0] })
  totalVote = await deployedContract.methods.totalVotesFor(web3.utils.asciiToHex(candidateName)).call()
  console.log(response)
  console.log(`candidate Name ${candidateName} total vote after you ${totalVote}`)
}

async function privateKeyTransaction(privateKeyUser) {

  testnet = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
  web3 = new Web3(new Web3.providers.HttpProvider(testnet))

  let source = fs.readFileSync('voting.sol', 'utf8');
  let compiledContract = solc.compile(source, 1);
  let abi = compiledContract.contracts[':Voting'].interface;
  let bytecode = compiledContract.contracts[':Voting'].bytecode;
  listOfCandidates = ['Rama', 'Nick', 'Jose']
  // abi = JSON.parse(fs.readFileSync('voting_sol_Voting.abi').toString())
  // bytecode = fs.readFileSync('voting_sol_Voting.bin').toString()

  let gasEstimate = web3.eth.estimateGas({ data: '0x' + bytecode });
  console.log(gasEstimate)

  let deployedContract = web3.eth.contract(JSON.parse(abi));
  // var contractData = deployedContract.new( listOfCandidates.map(name => web3.toHex(name)), {
  //   from: accounts.address,
  //   data: bytecode,
  //   gas: gasEstimate
  // }, function (err, myContract) {
  //   if (!err) {
  //     if (!myContract.address) {
  //       console.log(myContract.transactionHash)
  //     } else {
  //       console.log(myContract.address)
  //     }
  //   }
  //   else{
  //     console.log(err)
  //   }
  // });
  contractData = deployedContract.new.getData({
    data: '0x' + bytecode
  });
  response = broadcastTransaction(contractData)
  console.log(response)
  let receipt = await web3.eth.getTransactionReceipt(response);
  console.log('Contract address: ' + receipt.contractAddress);
}

function getGasPrice() {
  return new Promise((resolve, reject) => {
    web3.eth.getGasPrice(function (error, response) {
      if (error){
        reject(console.log(error))
      }
      resolve(response.c)
    })
  })
}

async function broadcastTransaction(contract, gasLimit) {

  let gasPrice = await getGasPrice()
  let gasPriceHex = web3.toHex(gasPrice[0]);
  let gasLimitHex = web3.toHex(gasLimit);
  let nonce = web3.eth.getTransactionCount(accounts.address);
  let nonceHex = web3.toHex(nonce);

  let rawTx = {
    nonce: nonceHex,
    gasPrice: gasPriceHex,
    gasLimit: gasLimitHex,
    data: contract,
    from: accounts.address,
    chainId: 4
  };

  let tx = new EthereumTx(rawTx, { chain: 'rinkeby', hardfork: 'petersburg' })
  privateKey = new Buffer.from(accounts.key, 'hex')
  tx.sign(privateKey);
  let serializedTx = tx.serialize();

  finalTransaction = '0x' + serializedTx.toString('hex')

  web3.eth.sendRawTransaction(finalTransaction, (err, hash) => {
    if (!err) {
      console.log('Contract creation tx: ' + hash);
      return hash;
    }
    else {
      console.log(err);
      return error;
    }
  });

}


async function main() {
  userInput = await inquirer.prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Which operation do you want to perform?',
      choices: ['Deploy contract', 'Vote', "Deploy using private key"],
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
    case "Deploy using private key": {
      userChoice = await inquirer.prompt([
        {
          name: 'privateKey',
          message: 'Enter your private key',
          default: process.env.KEY
        },
      ])
      let privateKey = userChoice.privateKey
      privateKeyTransaction(privateKey)
      break;
    }
  }
}

main()

