/*
export function someMutation (state) {
}
*/

export const setSelectedPool = (state, pool) => {
  state.selectedPool = pool
  console.log(pool, 'pool')
}
export const setPools = (state, pools) => {
  state.pools = pools
}
export const updatePools = (state, pool) => {
  state.pools.push(pool)
}
export const setTokens = (state, tokens) => {
  state.zapperTokens = tokens
}
export const updateGasPrice = (state, gasPrice) => {
  state.gasPrice = gasPrice
}
export const setMetamaskConnectionStatus = (state, status) => {
  state.metamaskConnected = status
}
export const setStakeData = (state, index) => {
  state.stakeData = state.investmentOpportunities[index]
}
export const getRois = (state, updated) => {
  var grossROI = 0, netROI = 0
  let index = state.pools.findIndex(o => o.contractAddress === updated.contractAddress)
  if (updated.platform === 'Uniswap V2') {
    if (updated.value === 'WBTC / ETH') {
      var l = parseFloat(updated.liquidity) / updated.supply,
        historical = state.poolDataHistory[updated.platform.replace(/[^a-z0-9+]+/gi, '')].find(function (t) {
          return t.address.toLowerCase() === updated.contractAddress.toLowerCase()
        }
        )
      if (historical) {
        var d = state.pools[index] ? historical.value : 0,
          m = state.pools[index] ? (historical.reserve0 * updated.price0 + historical.reserve1 * updated.price1) / historical.supply : 0
        grossROI = state.pools[index] ? 100 * (l / d - 1) : 0
        netROI = state.pools[index] ? 100 * (l / m - 1) : 0
        console.log(l, m, d, m / d, updated.poolName, updated)
      }
    }
    state.pools[index].ROI = grossROI
    state.pools[index].netROI = netROI
  }
}
export const setPoolHistoricalData = (state, payload) => {
  state.poolDataHistory[payload.platform] = payload.data
}
export const resetAccountDetails = (state, payload) => {
  state.investments = []
  state.transactions = []
  state.debts = []
  state.defaultAccount = payload
}

export const setMarketData = (state, payload) => {
  state.marketData = payload
}
export const setInvestments = (state, payload) => {
  state.investments = state.investments.concat(payload.pools ? payload.pools : payload).map((o, index) => {
    o.index = index
    return o
  }).filter(o => !o.canStake)
  state.investmentOpportunities = state.investmentOpportunities.concat(payload.pools ? payload.pools : payload).map((o, index) => {
    o.index = index
    return o
  }).filter(o => o.canStake)
}
export const setTransactions = (state, payload) => {
  state.transactions = state.transactions.concat(payload.filter(item => !state.transactions.find(o => o.hash === item.hash))).map((o, index) => {
    o.index = index
    return o
  })
}
export const setDebts = (state, payload) => {
  state.debts = state.debts.concat(payload.filter(item => !state.debts.find(o => o.hash === item.hash))).map((o, index) => {
    o.index = index
    return o
  })
}
export const setDefaultAccount = (state, payload) => {
  state.defaultAccount = payload
}
export const setTableLoadingStatus = (state, payload) => {
  state.tableLoading = payload
}
