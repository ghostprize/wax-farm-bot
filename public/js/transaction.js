	// Common param
	const { TaskTimer } = tasktimer;
	const wax = new waxjs.WaxJS({
		rpcEndpoint: 'https://api.wax.alohaeos.com/', //'https://api.waxsweden.org', // // , 'https://wax.pink.gg'
		tryAutoLogin: true,
		waxSigningURL: "https://all-access.wax.io",
		waxAutoSigningURL: "https://api-idm.wax.io/v1/accounts/auto-accept/"
	});
	
	const fwToolsColor = {"Wood": "Sienna", "Food": "DodgerBlue", "Gold": "Gold"};
	const fwMembersColor = {"Bronze Member": "Khaki", "Silver Member": "Silver", "Gold Member": "Yellow"};
	const nftPandaColor = {"earth": "Sienna", "water": "DodgerBlue", "fire": "Crimson", "wind": "MediumSeaGreen"};
  const nftPandaWeapon = {"0": "Common", "1": "Uncommon", "2": "Rare", 
                          "3": "Epic", "4": "Legendary", "5": "Mythic"};
  const nftPandaFEED = 3500;
	const fwRepair = 30;
	const fwRecover = 100;
	let toolconf;
	let cropconf;
	let mbconf;

	const dropdownlistPandaFoodList = document.getElementById("pandaFoodList");
	const dropdownlistPandaFoodUnit = document.getElementById("pandaFoodUnit");
	const pandaFoodList = ["common", "uncommon", "rare", "epic", "legendary", "mythic"];
	const pandaFoodPrice = [0.11, 0.22, 0.6, 1, 4, 12];
	const pandaFoodUnit = [1, 5, 10, 20];
	pandaFoodList.forEach(element => {
	let option = document.createElement("OPTION");
	option.innerHTML = element;
	option.value = element;
	dropdownlistPandaFoodList.options.add(option);
	});

	pandaFoodUnit.forEach(element => {
	let option = document.createElement("OPTION");
	option.innerHTML = element;
	option.value = element;
	dropdownlistPandaFoodUnit.options.add(option);
	});
	const officelandJoblist = {"intern":2, "junior":3, "senior":4, "leader":5, "manager":6, "boss":6};
	const officelandColor = {"intern":"Silver", "junior":"MediumSeaGreen", 
                          "senior":"Gold", "leader":"MediumOrchid",
                          "manager":"OrangeRed", "boss":"DarkSlateBlue"};
  const officelandRarityRates = {"intern":50, "junior":60, "senior":70, "leader":85, "manager":98, "boss":100};
	const officelandSuccessRateSleep = 40;
  // GET TOKEN https://api.waxsweden.org/v2/state/get_account?account=
	// END  

	async function login() {
		try {
			const userAccount = await wax.login();
			document.getElementById('updater').value = userAccount;
			await getCurrentMessage();
			console.log("LOGIN SUCCESS!");
			toolconf = await getTableAll("farmersworld", "toolconfs", 100);
			cropconf = await getTableAll("farmersworld", "cropconf", 100);
			mbconf = await getTableAll("farmersworld", "mbsconf", 100);
      await getUsage();
      document.getElementById("waxusd").innerHTML = "₩";
    } catch(e) {
			document.getElementById('response').append(e.message);
		}
	}

  async function getUsage(){
    let get_account;
    try{
      get_account = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('http://wax.eosphere.io/v2/state/get_account?account='+wax.userAccount)}`)
                    .then(response => response.json());
      get_account = JSON.parse(get_account.contents);
    }
    catch{
      get_account = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://api.wax.alohaeos.com/v2/state/get_account?account='+wax.userAccount)}`)
                    .then(response => response.json());
      get_account = JSON.parse(get_account.contents);
    }
    const cpuUsage = Math.floor(100*get_account.account.cpu_limit.used/get_account.account.cpu_limit.max);
    const waxInWallet = get_account.account.core_liquid_balance.split(" ")[0];
    let sInnerHTML = `<div class="progress" style="height: 25px; width: 75%; background-color: Silver;">
        <div class="badge d-inline bg-secondary text-white" style="font-size: medium;">${parseFloat(waxInWallet).toFixed(2)} WAX</div>&nbsp;
        <div class="progress-bar" role="progressbar" aria-valuemin="0"
          aria-valuemax="100" aria-valuenow="${cpuUsage}" style="width-max: 100%; width: ${cpuUsage*0.75}%;
          background-color: rgb(0, 0, 205); font-size: medium;"><b>CPU: ${cpuUsage}%</b></div>
      </div>`;
    document.getElementById("usage").innerHTML = sInnerHTML;

    get_account.tokens.forEach(token => {
      if(token.symbol == "FWG")
        document.getElementById("fwDepositFWG").placeholder = "Your have " + token.amount.toString() + " FWG";
      else if(token.symbol == "FWF")
        document.getElementById("fwDepositFWF").placeholder = "Your have " + token.amount.toString() + " FWF";
    });
  }

//////////////////////////////////GOTOFARMERSWORLD///////////////////////
  async function Farmersworld_main() {
    if (!document.getElementById("fwCheck").checked){
      return;
    }
    
    const balance = await getTableRows("farmersworld", "accounts", wax.userAccount);
    const fee = await getTableRows("farmersworld", "config", "");
    
    let balanceGold = 0;
    let balanceFood = 0;
    let balanceWood = 0;
    balance.balances.forEach(item => {
    	if (item.includes("GOLD")) 
    		balanceGold = item.split(" ")[0];
    	else if(item.includes("FOOD"))
    		balanceFood = item.split(" ")[0];
    	else if(item.includes("WOOD"))
    		balanceWood = item.split(" ")[0];
    	}
    );

    let sInnerHTML = "";
    sInnerHTML += `<img src="/js/FWW.png"></img> ${parseFloat(balanceWood).toFixed(2)},&nbsp; 
		<img src="/js/FWF.png"></img> ${parseFloat(balanceFood).toFixed(2)},&nbsp;<img src="/js/FWG.png"></img> ${parseFloat(balanceGold).toFixed(2)}<br>`;
    sInnerHTML += `<div class="badge d-inline bg-info text-white" style="font-size: large;">Energy ${balance.energy}/${balance.max_energy}</div><br>`;
    sInnerHTML += "<br>Tools<br>";

    sInnerHTML += await fwTools(balanceGold, balance);
    
    sInnerHTML += "<br>Member<br>";
    sInnerHTML += await fwMembers();
    sInnerHTML += `<br>FarmPlot<br>`;
    sInnerHTML += await fwCrops();
    document.getElementById('resFarmersworld').innerHTML = sInnerHTML;

    if (balance.energy < fwRecover)
    {
      let recover = balanceFood * 5;
      if (recover == 0)
      {
        $.ajax({
            type: "POST",
            url: "/submit",
            data: {
                  token: $("#lineToken").val(),
                  detail: `FW => Need more 🐟\n ${balanceFood} remains!\n` +
                  `Energy ${balance.energy}/${balance.max_energy}`
              }
          });
          return;
      }
      if (recover > balance.max_energy) recover = balance.max_energy - balance.energy;
      let config = {
              actions: [{
                account: 'farmersworld',
                name: 'recover',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  owner: wax.userAccount,
                  energy_recovered: recover
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
		console.log(`${recover} energy, RECOVER SUCCESS!`);
		$.ajax({
		    type: "POST",
		    url: "/submit",
		    data: {
			  token: $("#lineToken").val(),
			  detail: `FW => RECOVER SUCCESS 🐟`
		      }
		  });
	}
        else{console.log(`${recover} energy, RECOVER FAILED! ${ret}`);}
    }
  }

  async function getTokensPrices() {
    await getUsage();
    let price = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=WAX&vs_currencies=USD");
    price = await price.json();
    document.getElementById("waxusd").innerHTML = "&nbsp;₩: " + parseFloat(price.wax.usd).toFixed(4) +"&nbsp;";

    let SEST = await fetch("https://wax.alcor.exchange/api/markets/156");
    SEST = await SEST.json();
    await new Promise(r => setTimeout(r, 1000));
    let CBIT = await fetch("https://wax.alcor.exchange/api/markets/268");
    CBIT = await CBIT.json();

    document.getElementById('ftBalance').innerHTML = 
    `<div class="d-inline-block w-100">&nbsp;
      <div class="badge rounded-pill bg-light text-dark">
        <img src="/js/SEST.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>&nbsp;${parseFloat(SEST.last_price).toFixed(4)} WAX</div>&nbsp;
      <div class="badge rounded-pill bg-light text-dark">
        <img src="/js/CBIT.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>&nbsp;${parseFloat(CBIT.last_price).toFixed(4)} WAX</div>
    </div>`;

    let BAM = await fetch("https://wax.alcor.exchange/api/markets/155").then(res => res.json());
    document.getElementById('pandaBalance').innerHTML = 
    `<div class="d-inline-block w-100">&nbsp;
      <div class="badge rounded-pill bg-light text-dark">
        <img src="/js/BAM.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>
        &nbsp;${parseFloat(BAM.last_price).toFixed(4)} WAX</div>
    </div>`;

    let Ocoin = await fetch("https://wax.alcor.exchange/api/markets/258").then(res => res.json());
    document.getElementById('officelandBalance').innerHTML = 
    `<div class="d-inline-block w-100">&nbsp;
      <div class="badge rounded-pill bg-light text-dark">
        <img src="/js/OCOIN.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>
        &nbsp;${parseFloat(Ocoin.last_price).toFixed(4)} WAX</div>
    </div>`;

    let FWW = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://wax.alcor.exchange/api/markets/104/')}`)
                    .then(response => response.json());
    FWW = JSON.parse(FWW.contents);
	  
    let FWF = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://wax.alcor.exchange/api/markets/105/')}`)
                    .then(response => response.json());
    FWF = JSON.parse(FWF.contents);
	  
    let FWG = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://wax.alcor.exchange/api/markets/106/')}`)
                    .then(response => response.json());
    FWG = JSON.parse(FWG.contents);
	  
    document.getElementById('fwBalance').innerHTML = 
    `<div class="d-inline-block w-100">&nbsp;<div class="badge rounded-pill bg-light text-dark"><img src="/js/FWWtoken.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>&nbsp;${parseFloat(FWW.last_price).toFixed(4)} WAX</div>
    &nbsp;<div class="badge rounded-pill bg-light text-dark"><img src="/js/FWFtoken.png" style='height: 15px;align-items: center;vertical-align: middle;'></img>&nbsp;${parseFloat(FWF.last_price).toFixed(4)} WAX</div>
    &nbsp;<div class="badge rounded-pill bg-light text-dark"><img src="/js/FWGtoken.png" style='height: 15px;align-items: center;vertical-align: middle;'></img>&nbsp;${parseFloat(FWG.last_price).toFixed(4)} WAX</div></div>`;
    
  }
  
	async function fwMembers(){
    let sInnerHTML = "";
		const mbs = await getTableRows_byIndex("farmersworld", "mbs", wax.userAccount, '2', 'name');
		mbs.forEach(async element => {
			const mbName = mbconf.rows.find(elem => elem.template_id === element.template_id);
			
      sInnerHTML += `<div class="d-inline-flex w-100">
						<div class="badge text-white" style="width: 130px; background-color: ${fwToolsColor[mbName.type]};">${mbName.name}</div>&emsp;
						<div class="badge" style="width: 120px;">&emsp;</div>&emsp;
						<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(element.next_availability - Date.now()/1000)}</div>
					</div><br>`;
			// document.getElementById('resFarmersworld').innerHTML += `<div class="d-inline-flex w-100">
			// 			<div class="badge text-white" style="width: 130px; background-color: ${fwToolsColor[mbName.type]};">${mbName.name}</div>&emsp;
			// 			<div class="badge" style="width: 120px;">&emsp;</div>&emsp;
			// 			<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(element.next_availability - Date.now()/1000)}</div>
			// 		</div><br>`;
      if (element.next_availability - Date.now()/1000 < 0){
        let config = {
              actions: [{
                account: 'farmersworld',
                name: 'mbsclaim',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  owner: wax.userAccount,
                  asset_id: element.asset_id
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
          console.log(`Id ${ element.asset_id}, HARVEST SUCCESS!`);
          $.ajax({
              type: "POST",
              url: "/submit",
              data: {
                    token: $("#lineToken").val(),
                    detail: `FW => Member Id ${element.asset_id},🪓 HARVEST SUCCESS!\n` 
                }
            });
        }
        else{ console.log(`Id ${ element.asset_id}, HARVEST FAILED! ${ret}`); }
      }
    });
    return sInnerHTML;
  }
  
	async function fwCrops(){
    let sInnerHTML = "";
		const crops = await getTableRows_byIndex("farmersworld", "crops", wax.userAccount, '2', 'name');
		if(crops.length < 8)
    {
      const building = await getTableRows_byIndex("farmersworld", "buildings", wax.userAccount, '2', 'name');
      building.forEach(async element => {
        if (element.next_availability - Date.now()/1000 < 0){
          let config = {
              actions: [{
              account: 'farmersworld',
              name: 'bldclaim',
              authorization: [{
                actor: wax.userAccount,
                permission: 'active',
              }],
              data: {
                owner: wax.userAccount,
                asset_id: element.asset_id
              },
            }]
          };
          let ret = await sign(config);
          if (ret == true){
            console.log(`Id ${element.asset_id}, BUILD SUCCESS!`);
          }
          else{
            console.log(`Id ${element.asset_id}, BUILD FAILED! ${ret}`);
          }
        }

        if(element.name == "Farm Plot" && element.slots_used < 8)
        {
          let seed = await fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1000&template_whitelist=298595&collection_name=farmersworld&owner=" + wax.userAccount).then(response => response.json());
          if(seed.data.length == 0)
          {
            seed = await fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?page=1&limit=1000&template_whitelist=298596&collection_name=farmersworld&owner=" + wax.userAccount).then(response => response.json());
          }
          if(seed.data.length == 0)
          {
            return;
          }
          let config = {
              actions: [{
                account: 'atomicassets',
                name: 'transfer',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  from: wax.userAccount,
                  to: "farmersworld",
                  asset_ids: [seed.data[0].asset_id],
                  memo: "stake"
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
		console.log(`Id ${seed.data[0].asset_id}, STAKE CROPS SUCCESS!`);
	}
        else {console.log(`Id ${seed.data[0].asset_id}, STAKE CROPS FAILED! ${ret}`);}
        }
      });
    }

    crops.forEach(async (element, index) => {
		  	const cropName = cropconf.rows.find(elem => elem.template_id === element.template_id);
			sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge bg-warning text-dark" style="width: 130px;">${cropName.name}</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${element.times_claimed}/42</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(element.next_availability - Date.now()/1000)}</div>
				</div><br>`;
        
			if (element.next_availability - Date.now()/1000 < 0){
				let config = {
					  actions: [{
						account: 'farmersworld',
						name: 'cropclaim',
						authorization: [{
						  actor: wax.userAccount,
						  permission: 'active',
						}],
						data: {
						  owner: wax.userAccount,
						  crop_id: element.asset_id
						},
					  }]
					};
				let ret = await sign(config);
				if (ret == true){
					console.log(`Id ${element.asset_id}, HARVEST SUCCESS!`);
					  $.ajax({
					      type: "POST",
					      url: "/submit",
					      data: {
						    token: $("#lineToken").val(),
						    detail: `FW => Crops ${index} ${cropName.name}, \n ${element.times_claimed}/42 🌽 WATERING SUCCESS!\n` 
						}
					    });
				}
				else{
					console.log(`Id ${ element.asset_id}, HARVEST FAILED! ${ret}`);
				}
      		}
  	});
    return sInnerHTML;
  }

	async function fwTools(balanceGold, balance){
    let sInnerHTML = "";
		const tools = await getTableRows_byIndex("farmersworld", "tools", wax.userAccount, '2', 'name');
		tools.sort(function(a, b) {
      return a.template_id - b.template_id;
    });
    tools.forEach(async element => {
      const toolName = toolconf.rows.find(elem => elem.template_id === element.template_id);
			
      sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge text-white" style="width: 130px; background-color: ${fwToolsColor[toolName.type]};">${toolName.template_name}</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${element.current_durability}/${element.durability}</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(element.next_availability - Date.now()/1000)}</div>
				</div><br>`;
			
      if (element.next_availability - Date.now()/1000 < 0){
        let config = {
              actions: [{
                account: 'farmersworld',
                name: 'claim',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  owner: wax.userAccount,
                  asset_id: element.asset_id
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
          console.log(`Id ${ element.asset_id}, HARVEST SUCCESS!`);
          $.ajax({
              type: "POST",
              url: "/submit",
              data: {
                    token: $("#lineToken").val(),
                    detail: `FW => ${toolName.template_name} Id ${element.asset_id},🪓 HARVEST SUCCESS!\n` +
                    `current_durability: ${element.current_durability}/${element.durability}\n`+
                    `Energy ${balance.energy}/${balance.max_energy}` 
                }
            });
        }
        else{ console.log(`Id ${ element.asset_id}, HARVEST FAILED! ${ret}`); }
      }

      if (element.current_durability < fwRepair)
      {
        let goldNeed = (element.durability - element.current_durability) / 5;
        if ( goldNeed > balanceGold )
        {
          $.ajax({
            type: "POST",
            url: "/submit",
            data: {
                  token: $("#lineToken").val(),
                  detail: `FW => Need more 🎟️\n ${balanceGold} remains!\n` +
                  `current_durability: ${element.current_durability}/${element.durability}` 
              }
          });
          return;
        }

        let config = {
              actions: [{
                account: 'farmersworld',
                name: 'repair',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  asset_owner: wax.userAccount,
                  asset_id: element.asset_id
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
		console.log(`Id ${ element.asset_id}, REPAIR SUCCESS!`);
		$.ajax({
		    type: "POST",
		    url: "/submit",
		    data: {
			  token: $("#lineToken").val(),
			  detail: `FW => REPAIR ${toolName.template_name} \n Id ${element.asset_id} SUCCESS 🎟️`
		      }
		  });
	}
        else{console.log(`Id ${ element.asset_id}, REPAIR FAILED! ${ret}`);}
      }
    });
    return sInnerHTML;
  }
  
  async function fwDepositFWG(){
  	let goldAmount = document.getElementById('fwDepositFWG').value;
  	goldAmount = parseFloat(goldAmount).toFixed(4);
  	const _memo = "deposit";
  	const _quantity = [`${goldAmount} FWG`];
  	console.log(_quantity);
  	let config = {
              actions: [{
                account: 'farmerstoken',
                name: 'transfers',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  from: wax.userAccount,
                  to: "farmersworld",
                  quantities: _quantity,
                  memo: _memo
                },
              }]
            };
    let ret = await sign(config);
    if (ret == true){
        console.log(`DEPOSIT ${goldAmount} FWG DONE!`);
    }
    else { 
        console.log(`DEPOSIT FAILED`);
    }
  }
  
    async function fwDepositFWF(){
  	let foodAmount = document.getElementById('fwDepositFWF').value;
  	foodAmount = parseFloat(foodAmount).toFixed(4);
  	const _memo = "deposit";
  	const _quantity = [`${foodAmount} FWF`];
  	console.log(_quantity);
  	let config = {
              actions: [{
                account: 'farmerstoken',
                name: 'transfers',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  from: wax.userAccount,
                  to: "farmersworld",
                  quantities: _quantity,
                  memo: _memo
                },
              }]
            };
    let ret = await sign(config);
    if (ret == true){
        console.log(`DEPOSIT ${foodAmount} FWG DONE!`);
    }
    else { 
        console.log(`DEPOSIT FAILED`);
    }
  }
//////////////////////////////////GOTOFARMINGTAILES///////////////////////
  async function Farmingtales() {
    if (!document.getElementById("ftCheck").checked){
      return;
    }
    let sInnerHTML = "";

    const result_animal = await getTableRows_byIndex("farminggames", "animal", wax.userAccount, '2', 'name');
    
    const resource = await getTableRows("farminggames", "resources", wax.userAccount);
    const food = resource.food;
    const water = resource.water;
    const currency = await getTableRows("farminggames", "wallet", wax.userAccount);
    
    sInnerHTML += `
    <div class="d-inline-flex w-100">
      <div class="badge bg-success text-white" style="width: 150px;">FOOD: ${food}</div>&emsp;
      <div class="badge bg-primary text-white" style="width: 120px;">WATER: ${water}</div>&emsp;
      <div class="badge bg-warning text-dark" style="width: 120px;">${currency.balances[0].key}: ${parseFloat(currency.balances[0].value/10000).toFixed(2)}</div>&emsp;
      <div class="badge bg-warning text-dark" style="width: 150px;">${currency.balances[1].key}: ${parseFloat(currency.balances[1].value/10000).toFixed(2)}</div>&nbsp;
    </div><br><br>Farm<br>`;
    
    let refill = true;
    let asset_id;
    result_animal.forEach( async element => {
      let coolDown = await getTableRows("farminggames", 'confanimal', element.template_id.toString());
      asset_id = element.asset_id;
      let last_harvest = Date.now()/1000 - element.last_harvest;
      sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge bg-warning text-dark" style="width: 150px;">${coolDown.label}</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(coolDown.cooldown - last_harvest)}</div>
				</div><br>`;
      if (coolDown.cooldown - last_harvest < 0){
        let config = {
              actions: [{
                account: 'farminggames',
                name: 'harvestanim',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  account: wax.userAccount,
                  asset_id: element.asset_id
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
        console.log(`Id ${element.asset_id}, HARVEST SUCCESS!`);
        //$.ajax({
        //    type: "POST",
        //    url: "/submit",
        //    data: {
          // token: $("#lineToken").val(),
        //          detail: `FT => ${coolDown.label} 🐄 HARVEST SUCCESS!`
        //      }
        //  });
        }
        else{console.log(`Id ${element.asset_id}, HARVEST FAILED! ${ret}`);}
      }

      if (food < coolDown.food && refill){
        refill = false;
        let config = {
              actions: [{
                account: 'farminggames',
                name: 'refillfood',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  account: wax.userAccount
                },
              }]
            };
        let ret = await sign(config);
        if (ret==true){console.log("food_refill SUCCESS!");}
        else {console.log("food_refill FAILED!");}
      }      
    });

    const result_plant = await getTableRows_byIndex("farminggames", "plant", wax.userAccount, '2', 'name');
    refill = true;
    result_plant.forEach( async element => {
        let coolDown = await getTableRows("farminggames", 'confplant', element.plant_id.toString());
        asset_id = element.id;
        let last_harvest = Date.now()/1000 - element.last_harvest;
        // console.log(`asset_id ${asset_id}, ${coolDown.label} next_harvest ${sec2time(coolDown.cooldown - last_harvest)}`);
        sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge bg-success text-white" style="width: 150px;">${coolDown.label}</div>&emsp;
					<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(coolDown.cooldown - last_harvest)}</div>
				</div><br>`;
        if (coolDown.cooldown - last_harvest < 0){
          let config = {
                actions: [{
                  account: 'farminggames',
                  name: 'harvestgardn',
                  authorization: [{
                    actor: wax.userAccount,
                    permission: 'active',
                  }],
                  data: {
                    account: wax.userAccount,
                    asset_id: element.id
                  },
                }]
              };
          let ret = await sign(config);
          if (ret == true){
          console.log(`Id ${element.id}, HARVEST SUCCESS!`);
          $.ajax({
             type: "POST",
             url: "/submit",
             data: {
                  token: $("#lineToken").val(),
                   detail: `FT => ${coolDown.label} 🍅 HARVEST SUCCESS!`
               }
           });
          }
          else{console.log(`Id ${element.id}, HARVEST FAILED! ${ret}`);}
        }
  
        if (water < coolDown.water && refill){
          refill = false;
          let config = {
                actions: [{
                  account: 'farminggames',
                  name: 'refillwater',
                  authorization: [{
                    actor: wax.userAccount,
                    permission: 'active',
                  }],
                  data: {
                    account: wax.userAccount
                  },
                }]
              };
          let ret = await sign(config);
          if (ret==true){console.log("water_refill SUCCESS!");}
          else {console.log("water_refill FAILED!");}
        }      
      });
      document.getElementById('resFarmingtales').innerHTML = sInnerHTML;
  }

  async function sign(configTranscat) {
    if(!wax.api) {
      return document.getElementById('response').innerHTML = '* Login first *';
    }

    const updater = document.getElementById('updater').value;
    const message = document.getElementById('message').value;
    const fail = document.getElementById('fail').checked;

    try {
      const result = await wax.api.transact(configTranscat, {
        blocksBehind: 3,
        expireSeconds: 30
      });
      
      document.getElementById('response').innerText = JSON.stringify(result);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
      // await getCurrentMessage();
    } catch(e) {
      document.getElementById('response').innerText = e.message;
      return e.message;
    }
  }

  async function getTableRows_byIndex(code, tableName, bound, index, key_type){
    if (typeof(code) != "string" || 
        typeof(bound) != "string" || 
        typeof(tableName) != "string" || 
        typeof(index) != "string" || 
        typeof(key_type) != "string") {
      return false;
    }
    let result;
    try {
      result = await wax.api.rpc.get_table_rows({
        json: true,               // Get the response as json
        code: code,      // Contract that we target
        scope: code,         // Account that owns the data
        table: tableName,        // Table name
        index_position: index,
        key_type: key_type,
        lower_bound: bound,
        upper_bound: bound,
        reverse: false,           // Optional: Get reversed data
    });
    } catch(e) {
      document.getElementById('response').innerHTML = e.message;
      console.log("ERROR FOR: " + code + ", " + tableName + ", " + bound);
    }
    return result.rows;
  }

  async function getTableRows(code, tableName, bound, limit=1){
    if (typeof(code) != "string" || 
        typeof(bound) != "string" || 
        typeof(tableName) != "string") {
      return false;
    }
    let result;
    try {
      result = await wax.api.rpc.get_table_rows({
        json: true,               // Get the response as json
        code: code,      // Contract that we target
        scope: code,         // Account that owns the data
        table: tableName,        // Table name
        lower_bound: bound,
        upper_bound: bound,
        limit: limit,                // Maximum number of rows that we want to get
        reverse: false,           // Optional: Get reversed data
        show_payer: false          // Optional: Show ram payer
    });
    } catch(e) {
      document.getElementById('response').append(e.message);
      console.log("ERROR FOR: " + code + ", " + tableName + ", " + bound);
    }
    return result.rows[0];
  }
	
	async function getTableAll(code, tableName, limit=100){
		let result;
		try {
		  result = await wax.api.rpc.get_table_rows({
			json: true,               // Get the response as json
			code: code,      // Contract that we target
			scope: code,         // Account that owns the data
			table: tableName,        // Table name
			lower_bound: "",
			upper_bound: "",
			limit: limit,                // Maximum number of rows that we want to get
			reverse: false,           // Optional: Get reversed data
			show_payer: false          // Optional: Show ram payer
		});
		} catch(e) {
		  document.getElementById('response').append(e.message);
		  console.log("ERROR FOR: " + code + ", " + tableName);
		}
		return result;
	  }
  
//////////////////////////////////GOTONFTPANDA///////////////////////
  async function getPanda(){
    
    if (!document.getElementById("pandaCheck").checked){
      return;
    }

    let sInnerHTML = "";
    let jsonFood = await fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nftpandawaxp&schema_name=food&owner="+wax.userAccount+"&page=1&limit=1000&order=desc&sort=asset_id");
    let FoodID = await jsonFood.json();
    sInnerHTML += `<div class="d-inline-flex w-100">
      <div class="badge bg-success text-white" style="width: 150px;">FOOD: ${Object.keys(FoodID.data).length}</div></div>`;
      
    let res = await getTableRows("nftpandawofg", "usersnew", wax.userAccount);
    if (!res){
      console.log("GET PANDA ERROR");
      return;
    }
    
    for (let i=0; i<res.max_slots; i++){
      let ret = await getTableRows("nftpandawofg", 'nftsongamec', res.slots_count[i].toString());
      const namePanda = ret.name_pa.split("-")[1];
      // console.log(`asset_id ${res.slots_count[i]}, next_harvest ${sec2time(ret.timer - Date.now()/1000)}`);
      sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge text-white" style="width: 120px; background-color: ${nftPandaColor[ret.element]};">${namePanda}</div>&emsp;`
      if(ret.weapon != "0")
      {
        let getWeapon = await getTableRows("nftpandawofg", 'nftweapons', ret.weapon);
        sInnerHTML += `<div class="badge text-white" style="width: 130px; background-color: ${nftPandaColor[getWeapon.element]};">
          <img src="/js/PngItem_2767388.png" style='height: 15px;vertical-align: middle;align-items: center;'></img>&nbsp;${nftPandaWeapon[getWeapon.rarity]}
        </div>&emsp;`
      }
      else
      {
        sInnerHTML += `<div class="badge bg-secondary text-white" style="width: 130px;">None</div>&emsp;`
      }

      sInnerHTML += `<div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(ret.timer - Date.now()/1000)}</div>&emsp;
      <div class="badge bg-secondary text-white" style="width: 120px;">${ret.energy}/10000</div>
				</div><br>`;
      if (ret.timer - Date.now()/1000 < 0){
        let config = {
              actions: [{
                account: 'nftpandawofg',
                name: 'printrand',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  username: wax.userAccount,
                  assoc_id: res.slots_count[i],
                  signing_value: Math.floor(Math.random() * 18446744073709551616)
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){
          console.log(`Id ${res.slots_count[i]}, HARVEST SUCCESS!`);
          $.ajax({
             type: "POST",
             url: "/submit",
             data: {
                  token: $("#lineToken").val(),
                  detail: `Panda${i} => ${namePanda} 🐼 HARVEST SUCCESS!\n` +
                           `Food remain ${Object.keys(FoodID.data).length}`
               }
           });
        }
        else { console.log(`Id ${res.slots_count[i]}, HARVEST FAILED! ${ret}`); }
      }

      
      if (ret.energy < nftPandaFEED){
        let jsonFood = await fetch("https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=nftpandawaxp&schema_name=food&owner=" + wax.userAccount + "&page=1&limit=100&order=desc&sort=asset_id");
        let FoodID = await jsonFood.json();
        console.log(FoodID.data[0].asset_id);
        let config = {
              actions: [{
                account: 'atomicassets',
                name: 'transfer',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  from: wax.userAccount,
                  to: "nftpandawofg",
                  asset_ids: [FoodID.data[0].asset_id],
                  memo: "eatpanda " + res.slots_count[i] + " " + FoodID.data[0].asset_id
                },
              }]
            };
        let ret = await sign(config);
        if (ret == true){console.log(`Id ${res.slots_count[i]}, FEED SUCCESS!`);}
        else {console.log(`Id ${res.slots_count[i]}, FEED FAILED! ${ret}`);}
      }
    }
    document.getElementById('resnftPanda').innerHTML = sInnerHTML;
  }
  
  async function pandaBuyFood(){
  	const foodRarity = dropdownlistPandaFoodList.options[dropdownlistPandaFoodList.selectedIndex].text;
  	const foodAmount = dropdownlistPandaFoodUnit.options[dropdownlistPandaFoodUnit.selectedIndex].text;
  	const foodPrice = pandaFoodPrice[dropdownlistPandaFoodList.selectedIndex];
  	
  	const _quantity = `${parseFloat(foodAmount*foodPrice).toFixed(4)} BAM`;
  	const _memo = `buyeat ${foodRarity} ${foodAmount} `;
  	
  	let config = {
              actions: [{
                account: 'nftpandabamb',
                name: 'transfer',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  from: wax.userAccount,
                  to: "nftpandawofg",
                  quantity: _quantity,
                  memo: _memo
                },
              }]
            };
    let ret = await sign(config);
    if (ret == true){
        console.log(`BUY PANDA FOOD DONE!`);
    }
    else { 
        console.log(`BUY PANDA FOOD FAILED`);
    }
  }
//////////////////////////////////GOTOOFFICELAND///////////////////////
  async function Officeland_task(){
    let sInnerHTML = "";
    if (!document.getElementById("officelandCheck").checked){
      return;
    }
    
    let officelandBalance = await getTableRows("officegameio", "balances", wax.userAccount);
    // document.getElementById('officelandBalance').innerHTML = officelandBalance.quantity;
    // document.getElementById('resofficeland').innerHTML = `Ocoin: ${Ocoin.last_price}<br>`;
    sInnerHTML += `<div class="d-inline-flex w-100">
      <div class="badge bg-warning text-white" style="width: 180px;">${officelandBalance.quantity}</div></div>`;
    
    let res = await getTableRows("officegameio", "publicspace", wax.userAccount);
    if (!res){
      console.log("GET STAFF ERROR");
      return;
    }    
    res = res.asset_ids.filter(x => x!=0);

    for (let i=0; i<res.length; i++){
      let ret = [];
      ret = await getTableRows_byIndex("officegameio", 'taskassign', res[i].toString(), "2", "i64");
      let template_id = await fetch("https://wax.api.atomicassets.io/atomicmarket/v1/assets/" + res[i].toString()).then(response => response.json());
      const decreaseSR = await getTableRows_byIndex("officegameio", "assetsts", template_id.data.asset_id, "1", "i64");
      if (ret.length == 0){
      	// let jobNum = await getTableRows_byIndex("officegameio", 'rarity', template_id, "2", "i64");
      	const decreaseSR = await getTableRows_byIndex("officegameio", "assetsts", template_id.data.asset_id, "1", "i64");
        let jobNum = officelandJoblist[template_id.data.data.rarity];
        if (officelandRarityRates[template_id.data.data.rarity] - decreaseSR[0].asset_data.decrease_sr < officelandSuccessRateSleep)
          jobNum = 7;
        
        let config = {
              actions: [{
                account: 'officegameio',
                name: 'assigntask',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  player: wax.userAccount,
                  task_id: jobNum,
                  asset_id: res[i].toString()
                },
              }]
            };
        let ret_sign = await sign(config);
        if (ret_sign == true){
          console.log(`Id ${res[i].toString()}, GO WORK SUCCESS!`);
        }
        else { console.log(`Id ${res[i].toString()}, GO WORK FAILED! ${ret}`); }
        continue;
      }
      // document.getElementById('resofficeland').append(`asset_id ${res[i]}, next_harvest ${sec2time(ret[0].task_end - Date.now()/1000)}`);
      // document.getElementById('resofficeland').innerHTML += "<br>";
      sInnerHTML += `<div class="d-inline-flex w-100">
					<div class="badge text-white" style="width: 120px; background-color: ${officelandColor[template_id.data.data.rarity]};">${template_id.data.data.name}</div>&emsp;
          <div class="badge bg-secondary text-white" style="width: 120px;">${parseFloat(officelandRarityRates[template_id.data.data.rarity] - decreaseSR[0].asset_data.decrease_sr).toFixed(2)}%</div>&emsp;
          <div class="badge bg-secondary text-white" style="width: 120px;">${sec2time(ret[0].task_end - Date.now()/1000)}</div>
				</div><br>`;
      if (ret[0].task_end - Date.now()/1000 < 0){
      	let config = {
              actions: [{
                account: 'officegameio',
                name: 'taskfinished',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  player: wax.userAccount,
                  taskassign_id: ret[0].taskassign_id.toString()
                },
              }]
            };
        let ret_sign = await sign(config);
        if (ret_sign == true){
          console.log(`Id ${res[i].toString()}, FINISHED TASK!`);
        }
      }
    }
    
    res = await getTableRows("officegameio", 'waitclaims', wax.userAccount);
    res = res.claim_datas[0]
    if ((Date.now()/1000 - res.finish_time)/86400 > 5.01){
    	let config = {
              actions: [{
                account: 'officegameio',
                name: 'claim',
                authorization: [{
                  actor: wax.userAccount,
                  permission: 'active',
                }],
                data: {
                  player: wax.userAccount,
                  finish_id: res.finish_id.toString()
                },
              }]
            };
        let ret_sign = await sign(config);
    }
    document.getElementById('resofficeland').innerHTML = sInnerHTML;
  }

  async function getCurrentMessage() {
    const res = await wax.rpc.get_table_rows({
      json: true,
      code: 'test.wax',
      scope: 'test.wax',
      table: 'messages',
      lower_bound: wax.userAccount,
      upper_bound: wax.userAccount,
    });

    const message = res.rows[0] ? res.rows[0].message : `<No message is set for ${wax.userAccount}>`;
    document.getElementById('current').textContent = message;
  }

// --------------------------------------------Run at init---------------------------------------//
  // set a random value to the initial message value
  document.getElementById('message').value = Math.random().toString(36).substring(2);
  login(); // get onetime table

	const count = 10;
	const timerMain = new TaskTimer(1000);
  timerMain.add([
    {
      id: 'FarmingTales',       // unique ID of the task
      // tickDelay: 1,       // 1 tick delay before first run
      tickInterval: 53,   // run every 10 ticks (10 x interval = 10000 ms)
      totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
      callback(task) {
          // timerlogin.reset();
          console.log(`${task.id} task has run ${task.currentRuns} times.`);
          Farmingtales();
      }
    },
    {
      id: 'FarmersWorld',       // unique ID of the task
      // tickDelay: 1,       // 1 tick delay before first run
      tickInterval: 17,   // run every 10 ticks (10 x interval = 10000 ms)
      totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
      callback(task) {
          // timerlogin.reset();
          console.log(`${task.id} task has run ${task.currentRuns} times.`);
          Farmersworld_main();
      }
    },
    {
      id: 'nftPanda',       // unique ID of the task
      // tickDelay: 1,       // 1 tick delay before first run
      tickInterval: 61,   // run every 10 ticks (10 x interval = 10000 ms)
      totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
      callback(task) {
          // timerlogin.reset();
          console.log(`${task.id} task has run ${task.currentRuns} times.`);
          getPanda();
      }
    },
    {
      id: 'officeland',       // unique ID of the task
      // tickDelay: 1,       // 1 tick delay before first run
      tickInterval: 71,   // run every 10 ticks (10 x interval = 10000 ms)
      totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
      callback(task) {
          // timerlogin.reset();
          console.log(`${task.id} task has run ${task.currentRuns} times.`);
          Officeland_task();
      }
    },
    {
      id: 'tokenPrice',       // unique ID of the task
      // tickDelay: 0,       // 1 tick delay before first run
      tickInterval: 113,   // run every 10 ticks (10 x interval = 10000 ms)
      totalRuns: 0,       // run 2 times only. (set to 0 for unlimited times)
      callback(task) {
          // timerlogin.reset();
          console.log(`${task.id} task has run ${task.currentRuns} times.`);
          getTokensPrices();
      }
    }
    
  ]);
  timerMain.start()

  function sec2time(timeInSeconds) {
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60),
    milliseconds = time.slice(-3);
	return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2);
    //return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
  }

  function lineNotifyTest(){
    $.ajax({
            type: "POST",
            url: "/submit",
            data: {
                  token: $("#lineToken").val(),
                  detail: `TEST LINE NOTIFY from SIMPLE Farming bot` 
              }
          });
  }