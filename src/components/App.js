import { Tabs, Tab } from 'react-bootstrap'
import Dkp from '../abis/DKPContract.json'
import Govtoken from '../abis/Govtoken.json'
import Router from '../abis/Router.json'
import Factory from '../abis/Factory.json'
import Pair from '../abis/Pair.json'
import Erc20 from '../abis/Erc20.json'
import Pool from '../abis/Pool.json'
import Swap from '../abis/Swap.json'
import Stake from '../abis/Stake.json'
import React, {  Component } from 'react';

import Web3 from 'web3';
import './App.css';
import logo from '../Logo.png'

//const web3 = new Web3("https://api.s0.t.hmny.io") //Mainnet RPC
const web3 = new Web3("https://harmony-0-rpc.gateway.pokt.network") //Pokt RPC

class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    //const web3 = new Web3("https://api.s0.t.hmny.io") //Mainnet RPC
    const web3 = new Web3("https://harmony-0-rpc.gateway.pokt.network") //Pokt RPC
    const dkp = new web3.eth.Contract(Dkp.abi, '0x837C626dF66Ab6179143bdB18D1DD1a2618aE7e6')
    const govToken = new web3.eth.Contract(Govtoken.abi, '0x1DF82Bfb54A8134Fd34A02E51Af788d97b072a7F')
    const staker = new web3.eth.Contract(Stake.abi, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C')
    const currentRate = await dkp.methods.getRate().call()
    const currentLp = await dkp.methods.getLP(web3.utils.toWei('1')).call()
    const stakeBalance = await govToken.methods.balanceOf('0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
    const xSupply = await staker.methods.totalSupply().call()
    const xRate = stakeBalance / xSupply

    this.setState({ 
      web3: web3,
      rate: web3.utils.fromWei(currentRate.toString()),
      lp: web3.utils.fromWei(currentLp.toString()),
      xRate: xRate
    })

    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)
      const accounts = await web3.eth.getAccounts()
      if (document.querySelector('.enableEthereumButton') !== null) {
        const ethereumButton = document.querySelector('.enableEthereumButton')
        ethereumButton.addEventListener('click', () => {
          ethereumButton.disabled = true
          this.getAccount()
        })
      }
      //load balance
      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({ account: accounts[0], balance: balance, web3: web3, connected: true })
      } else {
        this.setState({ connected: false })
      }

      //load contracts
      try {
        const govToken = new web3.eth.Contract(Govtoken.abi, '0x1DF82Bfb54A8134Fd34A02E51Af788d97b072a7F')
        const dkp = new web3.eth.Contract(Dkp.abi, '0x837C626dF66Ab6179143bdB18D1DD1a2618aE7e6')
        const router = new web3.eth.Contract(Router.abi, '0x24ad62502d1C652Cc7684081169D04896aC20f30')
        const factory = new web3.eth.Contract(Factory.abi, '0x9014B937069918bd319f80e8B3BB4A2cf6FAA5F7')
        const pool = new web3.eth.Contract(Pool.abi, '0xDB30643c71aC9e2122cA0341ED77d09D5f99F924')
        const swap = new web3.eth.Contract(Swap.abi, '0x72885b5066424eCC1DE4A5a3EF8c377de07a467A')
        const lpToken = new web3.eth.Contract(Erc20.abi, '0xEb579ddcD49A7beb3f205c9fF6006Bb6390F138f')
        const staker = new web3.eth.Contract(Stake.abi, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C')

        const dkpAddress = '0x837C626dF66Ab6179143bdB18D1DD1a2618aE7e6'

        const currentRate = await dkp.methods.getRate().call()
        const currentLp = await dkp.methods.getLP(web3.utils.toWei('1')).call()
        const stakeBalance = await govToken.methods.balanceOf('0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
        const xSupply = await staker.methods.totalSupply().call()
        const xRate = stakeBalance / xSupply

        const allowed = await govToken.methods.allowance(this.state.account, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
        const xAllowed = await staker.methods.allowance(this.state.account, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
        const xAmount = await staker.methods.balanceOf(this.state.account).call()

        this.setState({
          token: govToken, dkp: dkp, router: router, factory: factory, pool: pool, swap: swap, lpToken: lpToken, address: dkpAddress,
          rate: web3.utils.fromWei(currentRate.toString()),
          lp: web3.utils.fromWei(currentLp.toString()),
          allowed: web3.utils.fromWei(allowed.toString()), 
          xAllowed: web3.utils.fromWei(xAllowed.toString()), 
          staker: staker, xRate: xRate, xAmount: xAmount
        })
      } catch (e) {
        console.log(e)
        console.log(this.state.connected)
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }

  async getAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    this.componentDidMount()
  }

  async update() {
    const balance = await this.state.web3.eth.getBalance(this.state.account)
    const rate = await this.state.dkp.methods.getRate().call()
    const lpPerOne = await this.state.dkp.methods.getLP(this.state.web3.utils.toWei('1')).call()

    const pairAddress = await this.state.factory.methods.getPair('0x72Cb10C6bfA5624dD07Ef608027E366bd690048F', '0x1DF82Bfb54A8134Fd34A02E51Af788d97b072a7F').call()
    console.log(pairAddress)
    const pair = new web3.eth.Contract(Pair.abi, pairAddress)
    const reserves = await pair.methods.getReserves().call()
    console.log(reserves)

    console.log(
      this.state.web3.utils.fromWei(balance.toString()) + "\n" + this.state.web3.utils.fromWei(rate.toString()) + "\n" + this.state.web3.utils.fromWei(lpPerOne.toString()))
  }

  async deposit(amount) {
    if (this.state.dkp !== 'undefined') {
      try {
        await this.state.dkp.methods.deposit().send({
          value: this.state.web3.utils.toWei(amount.toString()),
          from: this.state.account
        })
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async swap(tokenIn, tokenOut, amount) {

    let amountOutMin = await this.state.swap.methods.getAmountOutMin(tokenIn, tokenOut, web3.utils.toWei(amount.toString())).call()
    amountOutMin = (amountOutMin * 99) / 100
    console.log(web3.utils.fromWei(amountOutMin.toString()))
    try {
      await this.state.swap.methods.swap(tokenIn, tokenOut, web3.utils.toWei(amount.toString()), amountOutMin.toString(), this.state.account, web3.utils.toWei('60000')).send({
        //value: this.state.web3.utils.toWei(amount.toString()),
        from: this.state.account,
        gasPrice: await web3.eth.getGasPrice(),
        gasLimit: 210000
      })
    } catch (e) {
      console.log('Error, swap: ', e)
    }
  }

  async stake(amount) {
    try {
      await this.state.staker.methods.stake(amount).send({
        from: this.state.account
      })
    } catch (e) {
      console.log('Error, deposit: ', e)
    }
  }

  async unStake(amount) {
    try {
      await this.state.staker.methods.unStake(amount).send({
        from: this.state.account
      })
    } catch (e) {
      console.log('Error, deposit: ', e)
    }
  }

  async approveStake() {
    let approve_amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; //(2^256 - 1 )
    await this.state.token.methods.approve('0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C', approve_amount).send({from: this.state.account})
    const allowed = await this.state.token.methods.allowance(this.state.account, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
    this.setState({allowed: allowed})
  }

  async approveUnstake() {
    let approve_amount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; //(2^256 - 1 )
    await this.state.staker.methods.approve('0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C', approve_amount).send({from: this.state.account})
    const xAllowed = await this.state.staker.methods.allowance(this.state.account, '0xEF356871b5ad2e1457C832ABC0B06173A33a9B8C').call()
    this.setState({xAllowed: xAllowed})
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      connected: false,
      account: '',
      token: null,
      dkp: null,
      balance: 0,
      address: null,
      router: null,
      factory: null,
      pool: null,
      swap: null,
      lpToken: null,
      rate: '',
      lp: '',
      value: 0,
      xvalue: 0,
      svalue:0,
      staker: null,
      allowed: 0,
      xAllowed: 0,
      xRate: 1,
      xAmount: 0
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar fixed-top flex-md-nowrap p-0">
          <a
            className="navbar navbar-brand col-sm-3 col-md-2 mr-0"
            href="https://dexscreener.com/harmony/0x8766079a62ea0bd58cb3fd98c006a9321c3009c6"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <b>DKP</b>
            </div>
          </a>
          <div className='navbar-brand'>
            {this.state.connected ? 
            <b>One: {Math.round(web3.utils.fromWei(this.state.balance.toString()) * 100) / 100}</b>:
            <p></p>}
          </div>
          <div className='navbar-brand smaller'>
            <b>{this.state.account === "" ?
              <button className="enableEthereumButton btn btn-light">Connect</button> :
              this.state.account
            }</b>
          </div>
        </nav>
        <div className="container-fluid mt-4 text-center">
          <br></br>
          <h1>DK Protocol</h1>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content col-lg-3 ml-auto mr-auto">
                <Tabs defaultActiveKey="deposit" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Mint">
                    <div>
                      <br></br>
                      How much One would you like to mint with?
                      <br></br>
                      (Minimum of 10 One)
                      <br></br>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.depositAmount.value
                        this.deposit(amount)
                      }}>
                        <div className='form-group'>
                          <br></br>
                          <input
                            id='depositAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.depositAmount = input }}
                            onChange={e => this.setState({ value: e.target.value })}
                            className="form-control form-control-md"
                            placeholder='amount...'
                            required />

                        </div>
                        <div>
                          Expected mint amount: { this.state.rate ?
                          Math.floor(((this.state.value * this.state.lp) / this.state.rate) * 10000) / 10000 :
                          0 }
                        </div>
                        <div>
                          LP created per One: {Math.floor(this.state.lp * 10000) / 10000}
                        </div>
                        <div>
                          Mint Rate: {this.state.rate}
                        </div>
                        <button type='submit' className='btn btn-light mt-2'>Mint</button>
                      </form>

                    </div>
                  </Tab>
                  <Tab eventKey="stake" title="Stake">
                    <div>
                      <b>Stake tokens here</b>
                      <br></br>
                      xDKP Rate: {Math.floor(this.state.xRate * 10000) / 10000}
                      <br></br>
                      xDKP Amount: {Math.floor(web3.utils.fromWei(this.state.xAmount.toString()) * 100) / 100}
                      <form onSubmit={(e) => {
                        e.preventDefault()                      
                      }}>
                        <div className='form-group'>
                          <br></br>
                          <input
                            id='stakeAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.stakeAmount = input }}
                            onChange={e => this.setState({ svalue: e.target.value })}
                            className="form-control form-control-md mt-1"
                            placeholder='amount...'
                             />
                          <br></br>
                          {this.state.allowed <= 1000 ?
                          <button onClick={() => this.approveStake()} className='btn btn-light mt-1 mb-2'>Approve</button>:
                          <button onClick={() => this.stake(web3.utils.toWei(this.stakeAmount.value.toString()))} className='btn btn-light mt-1 mb-2'>Stake</button>
                          }
                          <br></br>
                          {this.state.svalue > 0 ?
                          "xDKP gotten: " + Math.floor((this.state.svalue / this.state.xRate) * 10000) / 10000 :
                          ""}

                          <br></br>
                          <input
                            id='unstakeAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.unstakeAmount = input }}
                            onChange={e => this.setState({ xvalue: e.target.value })}
                            className="form-control form-control-md mt-1"
                            placeholder='amount...'
                             />
                             <br></br>
                        {this.state.xAllowed <= 1000 ?
                          <button onClick={() => this.approveUnstake()} className='btn btn-light mt-1 mb-2'>Approve</button>:
                          <button onClick={() => this.unStake(web3.utils.toWei(this.unstakeAmount.value.toString()))} className='btn btn-light mt-1 mb-2'>Unstake</button>
                        }
                          <br></br>
                          {this.state.xvalue > 0 ?
                          "DKP returned: " + Math.floor((this.state.xvalue * this.state.xRate) * 10000) / 10000:
                          ""}
                          </div>
                      </form>
                    </div>
                  </Tab>
                  {/* <Tab eventKey="swap" title="Swap">
                    <div>
                      Swap tokens here
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.swapAmount.value
                        let tokenIn = '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a'
                        let tokenOut = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'
                        this.swap(tokenIn, tokenOut, amount)
                      }}>
                        <div className='form-group'>
                          <br></br>
                          <input
                            id='swapAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.swapAmount = input }}
                            className="form-control form-control-md"
                            placeholder='amount...'
                            required />
                          <br></br>

                          <br></br>
                          <input
                            id='swapAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.swapAmount = input }}
                            className="form-control form-control-md"
                            placeholder='received...'
                            required />
                        </div>
                        <button type='submit' className='btn btn-light mt-2'>Swap</button>
                      </form>
                    </div>
                  </Tab> */}
                  {/* <Tab eventKey="transactions" title="Transactions">
                    <div>
                      Placeholder
                      
                    </div>
                  </Tab> */}
                </Tabs>
              </div>
            </main>
          </div>
          <div className='logo fixed-bottom'>
            <img className="logo mb-5" src={logo} alt="Logo"></img>
          </div>
            <nav className="navbar fixed-bottom flex-md-nowrap p-0 shadow text-center">
              <div className="navbar-brand col-sm-3 col-md-2 mr-auto ml-auto text-center">
                DKP
              </div>
            </nav>
        </div>
      </div>
    );
  }
}

export default App;