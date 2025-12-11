import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { StacksMainnet, StacksTestnet } from '@stacks/network'
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
  const [counterValue, setCounterValue] = useState(0)
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
      setError(null)
      
      // Use the Stacks API to read the contract state
      const apiUrl = `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-counter`
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: CONTRACT_ADDRESS,
          arguments: [],
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Counter API response:', data)
      
      // Parse the Clarity response: (ok value) format
      // The response can be in different formats depending on the API version
      let value = null
      
      if (data.okay && data.result) {
        const result = data.result
        
        // Handle different result formats
        if (typeof result === 'number') {
          value = result
        } else if (typeof result === 'string') {
          // Handle hex format
          if (result.startsWith('0x')) {
            value = parseInt(result, 16)
          } 
          // Handle uint format like "u0", "u1", etc.
          else if (result.startsWith('u')) {
            value = parseInt(result.substring(1), 10)
          }
          // Handle plain number string
          else {
            value = parseInt(result, 10)
          }
        } else if (result && typeof result === 'object' && 'value' in result) {
          // Handle ClarityValue object format
          value = parseInt(result.value, 10)
        }
        
        if (value !== null && !isNaN(value)) {
          setCounterValue(value)
        } else {
          console.error('Could not parse result:', result, 'Type:', typeof result)
          setError('Failed to parse counter value')
        }
      } else if (data.result) {
        // Try to parse result directly if okay is not present
        const result = data.result
        if (typeof result === 'number') {
          setCounterValue(result)
        } else if (typeof result === 'string') {
          const parsed = parseInt(result.replace(/[^0-9-]/g, ''), 10)
          if (!isNaN(parsed)) {
            setCounterValue(parsed)
          } else {
            setError('Failed to parse counter value')
          }
        }
      } else {
        console.error('Unexpected API response:', data)
        setError('Failed to parse counter value')
      }
    } catch (err) {
      console.error('Error fetching counter:', err)
      setError('Failed to fetch counter value: ' + err.message)
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
          {error && (
            <div className="error">
              {error}
              <button onClick={fetchCounter} className="btn-retry">Retry</button>
            </div>
          )}
          
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

