import { Tabs, Tab } from 'react-bootstrap'
import Dkp from '../abis/DKPContract.json'
import Govtoken from '../abis/Govtoken.json'
import Router from '../abis/Router.json'
import Factory from '../abis/Factory.json'
import Pair from '../abis/Pair.json'
import Erc20 from '../abis/ERC20.json'
import Pool from '../abis/Pool.json'
import Swap from '../abis/Swap.json'
import React, { Component } from 'react';

import Web3 from 'web3';
import './App.css';

const web3 = new Web3(window.ethereum)

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()

      //load balance
      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({ account: accounts[0], balance: balance, web3: web3 })
      } else {
        window.alert('Please login with MetaMask')
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

        const dkpAddress = '0x837C626dF66Ab6179143bdB18D1DD1a2618aE7e6'

        this.setState({ token: govToken, dkp: dkp, router: router, factory: factory, pool: pool, swap: swap, lpToken: lpToken, address: dkpAddress })
        this.update()
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
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
    /* try {
      await this.state.swap.methods.swap(tokenIn, tokenOut, web3.utils.toWei(amount.toString()), amountOutMin.toString(), this.state.account, web3.utils.toWei('60000')).send({
        //value: this.state.web3.utils.toWei(amount.toString()),
        from: this.state.account,
        gasPrice: await web3.eth.getGasPrice(),
        gasLimit: 210000
      })
    } catch (e) {
      console.log('Error, swap: ', e)
    } */
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dkp: null,
      balance: 0,
      address: null,
      router: null,
      factory: null,
      pool: null,
      swap: null,
      lpToken: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
            <b>DKP</b>
            </div>
          </a>
          <div>
          <b>One: {Math.round(web3.utils.fromWei(this.state.balance.toString()) * 100) / 100}</b>
          </div>
          <div>
          <b>{this.state.account}</b>
          </div>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to DK Protocol</h1>
          
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deposit" title="Deposit">
                    <div>
                      <br></br>
                      How much One do you want to swap?
                      <br></br>
                      (min. amount is 10 One)
                      <br></br>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.depositAmount.value
                        this.deposit(amount)
                      }}>
                        <div className='form-group mr-sm-2'>
                          <br></br>
                          <input
                            id='depositAmount'
                            step="0.01"
                            type='number'
                            ref={(input) => { this.depositAmount = input }}
                            className="form-control form-control-md"
                            placeholder='amount...'
                            required />
                            
                        </div>
                        <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                      </form>

                    </div>
                  </Tab>
                  <Tab eventKey="swap" title="Swap">
                      <div>
                        Swap tokens here
                        <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.swapAmount.value
                        let tokenIn = '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a'
                        let tokenOut = '0x72Cb10C6bfA5624dD07Ef608027E366bd690048F'
                        this.swap(tokenIn, tokenOut, amount)
                      }}>
                        <div className='form-group mr-sm-2'>
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
                        <button type='submit' className='btn btn-primary'>Swap</button>
                      </form>
                      </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
