const Web3 = require('web3');
const inquirer = require('inquirer');
const fs = require('fs');
const dotenv = require('dotenv');
const solc = require('solc')
var EthereumTx = require('ethereumjs-tx').Transaction;
dotenv.config();

let accounts = {
  address: process.env.ADDRESS,
  key: process.env.KEY
}

testnet = `https://rinkeby.infura.io/${process.env.INFURA_ACCESS_TOKEN}`
web3 = new Web3(new Web3.providers.HttpProvider(testnet))

let source = fs.readFileSync('voting.sol', 'utf8');
let compiledContract = solc.compile(source, 1);
let abi = compiledContract.contracts[':Voting'].interface;
let bytecode = compiledContract.contracts[':Voting'].bytecode;
let listOfCandidates = ['Rama', 'Nick', 'Jose']

let deployedContract = web3.eth.contract(JSON.parse(abi));

async function voteForCandidate(candidateName) {
  console.log(candidateName);
  contractAddress = "0x7e6480Fe2C1c14555b4dBfF11Ba474E24e6f0580"
  web3.eth.defaultAccount = accounts.address;

  contract = deployedContract.at(contractAddress);
  let totalVote = contract.totalVotesFor.call(web3.toHex(candidateName))
  let contractData = contract.voteForCandidate.getData(web3.toHex(candidateName))
  console.log(`candidate Name ${candidateName} total vote ${totalVote}`)

  let gasEstimate = web3.eth.estimateGas({
    data: contractData,
    to: contractAddress
  });

  gasEstimate = Math.round(gasEstimate * 2)
  console.log(`Hex ${contractData} Estimated gas ${gasEstimate}`)
  hash = await broadcastTransaction(contractData, gasEstimate, contractAddress)
  totalVote = contract.totalVotesFor.call(web3.toHex(candidateName))

  console.log(`candidate Name ${candidateName} total vote after you ${totalVote}`)
}

async function privateKeyTransaction(privateKeyUser) {

  let gasEstimate = web3.eth.estimateGas({ data: '0x' + bytecode });

  contractData = deployedContract.new.getData(listOfCandidates.map(name => web3.toHex(name)), {
    data: '0x' + bytecode
  });

  gasEstimate = Math.round(gasEstimate * 2)
  hash = await broadcastTransaction(contractData, gasEstimate)
  let interval = setInterval(async function () {
    if (hash != null && hash != undefined) {
      let receipt = await web3.eth.getTransactionReceipt(hash);
      if (receipt != undefined && receipt != null){
        console.log('Contract address: ' + receipt.contractAddress);
        clearInterval(interval);
      }
      else
        console.log('Transaction not confirmed')  
    }
  }, 2000);
}

async function broadcastTransaction(contract, gasLimit, contractAddress) {
  return new Promise(async (resolve, reject) => {

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

    if (contractAddress != null || contractAddress != undefined)
      rawTx.to = contractAddress

    let tx = new EthereumTx(rawTx, { chain: 'rinkeby', hardfork: 'petersburg' })
    privateKey = new Buffer.from(accounts.key, 'hex')
    tx.sign(privateKey);
    let serializedTx = tx.serialize();

    finalTransaction = '0x' + serializedTx.toString('hex')

    web3.eth.sendRawTransaction(finalTransaction, (error, hash) => {
      if (!error) {
        console.log('Contract creation tx: ' + hash);
        resolve(hash);
      }
      else {
        console.log(error);
        reject(error);
      }
    });
  })
}

function getGasPrice() {
  return new Promise((resolve, reject) => {
    web3.eth.getGasPrice(function (error, response) {
      if (error) {
        reject(console.log(error))
      }
      resolve(response.c)
    })
  })
}

async function main() {
  userInput = await inquirer.prompt([
    {
      type: 'list',
      name: 'options',
      message: 'Which operation do you want to perform?',
      choices: ['Deploy using private key', 'Vote',],
    },
  ])

  switch (userInput.options) {

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

