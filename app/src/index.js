import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    if(!name || !id){ return; }
    try{
      await createStar(name, id).send({from: this.account});
      App.setStatus(`New Star(${name}) Owner is ${this.account}.`);
    }catch (error) {
      console.error(error);
      App.setStatus("Token Id exists");
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = document.getElementById("lookupById").value;
    if(!id){ return; }

    try{
      let starInfo= await lookUptokenIdToStarInfo(id).call();
      if(starInfo[0]){
        App.setStatus(`The Star Name is ${starInfo[0]}, The Star Owner is ${starInfo[1]}.`);
      }else{
        App.setStatus("Token Id does not exist");
      }
    }catch(err){
      console.error(err);
      App.setStatus(err);
    }
  },
  sell: async function(){
     const { lookUptokenIdToStarInfo } = this.meta.methods;
     const { putStarUpForSale } = this.meta.methods;
     let id = document.getElementById("sellById").value;
     let price = document.getElementById("sellPrice").value;
     let unit = document.getElementById("sellUnit").value;
     if(!id || !price){ return; }

     try{
          let starInfo= await lookUptokenIdToStarInfo(id).call();
          if(starInfo[1] === this.account){
              await putStarUpForSale( id, this.web3.utils.toWei(price, unit)).send({from: this.account});
              App.setStatus(`The Star (${starInfo[0]}), Token Id (${id}) putted up for sale, The price is ${price} ${unit}`);
          }else{
              App.setStatus("Only Star's owner can sell");
          }
        }catch(err){
          console.error(err);
          App.setStatus(err);
        }
      },
  buy: async function(){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const { buyStar } = this.meta.methods;
    let id = document.getElementById("buyById").value;
    let price = document.getElementById("buyPrice").value;
    let unit = document.getElementById("sellUnit").value;

    if(!id || !price){ return; }

    try{
      let starInfo= await lookUptokenIdToStarInfo(id).call();
      let starName = starInfo[0];
      let ownerAddress = starInfo[1];
      let starCost = this.web3.utils.fromWei(starInfo[2], 'ether'); // price is big number
      if(ownerAddress != this.account ){
        if( starCost > 0 ){
              await buyStar(id).send({from: this.account ,value: this.web3.utils.toWei(price, unit)});  // convert ether to wei
              App.setStatus(`You(${this.account}) owned the Star(${starName}).`);
          }else{
              App.setStatus("The Star isn't tradeable");
               }
      }else{
        App.setStatus("You can't buy yours Star");
       }
     }catch(err){
      console.error(err);
      App.setStatus("Not enough Ether!");
     }
   },
 exchangeStars: async function(){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const { exchangeStars } = this.meta.methods;
    let myID = document.getElementById("myID").value;
    let opponentID = document.getElementById("opponentID").value;

    if(!myID || !opponentID){ return; }

    try{
      let myStarInfo = await lookUptokenIdToStarInfo(myID).call();
      let myStarName = myStarInfo[0];
      let myAddress = myStarInfo[1];
      let myStarCost = this.web3.utils.fromWei(myStarInfo[2], 'ether'); // price is big number

      let oppStarInfo = await lookUptokenIdToStarInfo(opponentID).call();
      let oppStarName = oppStarInfo[0];
      let oppAddress = oppStarInfo[1];
      let oppStarCost = this.web3.utils.fromWei(oppStarInfo[2], 'ether');

      if(this.account == myAddress){
        if( myStarCost > 0 && oppStarCost > 0){
              await exchangeStars(myID,opponentID).send({from: this.account});
              App.setStatus(`You(${this.account}) owned the Star(${oppStarName}).Your Star(${myStarName}) transfer to ${oppAddress}`);
          }else{
              App.setStatus("The Star isn't tradeable");
              }
      }else{
        App.setStatus("You can't exchange this Star");
      }
    }catch(err){
      console.error(err);
      App.setStatus(err);
    }
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }

  App.start();
});
