import Web3 from 'web3';
import HookedWeb3Provider from "hooked-web3-provider";

const web3 = new Web3();

var erc20tokens = [];

const CPS_TEST_ADDR = "0x0E3E4BfD5a2572c1E0475029D43Ac0D274466017";
const CPS_PROD_ADDR = "0xf239fAb41De78533FA974B74d7605f1E68F8772e";
const CPST_PROD_ADDR = "0x978f6ee1D834704D0B9aFa4318d016Da4f9E6Ad6";
const CHIPS_ADDR = "0x68b16039d79e0f51f109015e55a3311fe999a723";

const erc20addrs = [
   // "0x0E3E4BfD5a2572c1E0475029D43Ac0D274466017",
    "0xf239fAb41De78533FA974B74d7605f1E68F8772e",
    "0x978f6ee1D834704D0B9aFa4318d016Da4f9E6Ad6",
    //CHIPS_ADDR,
  //"0xFFAB690958a463EB859B6348279A2F5FDdB8Eba1",
  //"0x60B6a6420e6295eaa7dEa24eb780eC567205ee05",
];

const erc20abi = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "spender", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenOwner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "to", "type": "address" }, { "name": "tokens", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenOwner", "type": "address" }, { "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "tokenOwner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "tokens", "type": "uint256" }], "name": "Approval", "type": "event" }];

//const httpProdBaseUrl = `http://api.etherscan.io/api?apikey=${apiKey}`;
//const httpTestBaseUrl = `http://ropsten.etherscan.io/api?apikey=${apiKey}`;

function setWebProvider(ks){

  var jsonRpcUrl = "https://mainnet.infura.io/CsS9shwaAab0z7B4LP2d";
  var web3Provider = ks?
      new HookedWeb3Provider({
    host: jsonRpcUrl,
    transaction_signer: ks
  }):
      new Web3.providers.HttpProvider(jsonRpcUrl)
  ;

  web3.setProvider(web3Provider);

  var ERC20Contract = web3.eth.contract(erc20abi);//support for any ERC20-compatible token

  erc20tokens = erc20addrs.map(function (addr) {
    var contract = ERC20Contract.at(addr)
      if(addr == CPS_TEST_ADDR){
          return {"address":addr, "contract": contract, "decimals": 8, "symbol": "CPSTest" };
      }
      else if(addr == CPS_PROD_ADDR){
          return {"address":addr, "contract": contract, "decimals": 8, "symbol": "CPS" };
      }
      else if(addr == CPST_PROD_ADDR){
          return {"address":addr, "contract": contract, "decimals": 2, "symbol": "CPST" };
      }
      else if(addr == CHIPS_ADDR){
          return {"address":addr, "contract": contract, "decimals": 8, "symbol": "CHIPS" };
      }
    return {"address":addr, "contract": contract, "decimals": contract.decimals.call(), "symbol": contract.symbol.call() };
  })
}
var padding = function (str, decimals) {
  str = str + ""
  var pad = ""
  for (var i = 0; i < decimals; i++) {
    pad += "0";
  }
  var ans = pad.substring(0, pad.length - str.length) + str
  return ans;
}

var toRealAmount = function (amount, decimals) {

  if(amount == null || typeof(amount) == 'undefined'){
      return amount;
  }
  if(decimals){
    var a = padding(amount, decimals);
    var ret = a.slice(0, a.length - decimals) + "." + a.slice(a.length - decimals);
    if(ret.indexOf('.') == 0)ret = "0"+ret;
    while(ret.length > 0 && ret.endsWith("0") && !ret.endsWith(".0")){
        ret = ret.slice(0, ret.length-1);
    }
    return ret;
  }else{
    return amount/1.0e18;
  }
}


function getWeb3(){
  return web3;
}

function getErc20Tokens(){
  return erc20tokens;
}

function getHttpBaseUrl(net){
  let host;
  switch(net){
    case 'TEST':
      host = `https://explorerapitest1.cpscoin.org`;
      break;
    case 'PROD':
    default:
      host = `https://explorerapi1.cpscoin.org/bcbrowser/`;
      break;
  }
  return `${host}`;
}

// var erc20tokens = {}

export default {
  setWebProvider,
  toRealAmount,
  getWeb3,
  getErc20Tokens,
  getHttpBaseUrl
};
