import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet, StacksTestnet } from '@stacks/network'
import { callReadOnlyFunction, contractPrincipalCV, standardPrincipalCV, uintCV, contractCall } from '@stacks/transactions'
import Counter from './components/Counter'
import './App.css'

// Contract configuration
// Update this with your deployed contract address
const CONTRACT_ADDRESS = 'SP2QNSNKR3NRDWNTX0Q7R4T8WGBJ8RE8RA516AKZP' // Your mainnet address
const CONTRACT_NAME = 'counter'
const NETWORK = new StacksMainnet() // Change to StacksTestnet() for testnet

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

function App() {
  const [userData, setUserData] = useState(null)
  const [counterValue, setCounterValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
    }
    fetchCounter()
  }, [])

  const fetchCounter = async () => {
    try {
      setLoading(true)
      const result = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-counter',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      })
      
      if (result && result.value !== undefined) {
        setCounterValue(Number(result.value))
      }
    } catch (err) {
      console.error('Error fetching counter:', err)
      setError('Failed to fetch counter value')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: 'Stacks Counter App',
        icon: window.location.origin + '/vite.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserData(userSession.loadUserData())
        fetchCounter()
      },
      userSession,
    })
  }

  const handleDisconnect = () => {
    userSession.signUserOut()
    setUserData(null)
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>🔢 Stacks Counter App</h1>
          {userData ? (
            <div className="user-info">
              <p>Connected: {userData.profile.stxAddress.mainnet}</p>
              <button onClick={handleDisconnect} className="btn btn-secondary">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={handleConnect} className="btn btn-primary">
              Connect Wallet
            </button>
          )}
        </header>

        <main>
          {error && <div className="error">{error}</div>}
          
          <Counter
            contractAddress={CONTRACT_ADDRESS}
            contractName={CONTRACT_NAME}
            network={NETWORK}
            userSession={userSession}
            counterValue={counterValue}
            loading={loading}
            onUpdate={fetchCounter}
          />
        </main>
      </div>
    </div>
  )
}

export default App

