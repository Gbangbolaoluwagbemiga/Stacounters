import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { intCV } from '@stacks/transactions'
import './Counter.css'

export default function Counter({ contractAddress, contractName, network, userSession, counterValue, loading, onUpdate }) {
  const [processing, setProcessing] = useState(false)
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const [incrementAmount, setIncrementAmount] = useState('1')
  const [decrementAmount, setDecrementAmount] = useState('1')

  const isSignedInSafe = () => {
    try {
      return userSession.isUserSignedIn()
    } catch (e) {
      console.warn('Wallet session error, treating as signed out:', e)
      return false
    }
  }

  const resetSession = () => {
    try {
      userSession.signUserOut()
    } catch {}
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && (/blockstack/i.test(k) || /stacks/i.test(k) || /stx/i.test(k))) {
            keys.push(k)
          }
        }
        keys.forEach(k => localStorage.removeItem(k))
      }
    } catch {}
    alert('Session reset. Please reconnect your wallet.')
  }

  const handleContractCall = async (functionName, amount = null) => {
    if (!isSignedInSafe()) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setProcessing(true)
      const functionArgs = []
      
      // If amount is provided, use the corresponding *-by function
      if (amount !== null) {
        const numAmount = parseInt(amount, 10)
        if (isNaN(numAmount) || numAmount <= 0) {
          alert('Please enter a valid positive number')
          setProcessing(false)
          return
        }
        functionArgs.push(intCV(numAmount))
      }
      
      await openContractCall({
        network,
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        onFinish: async (data) => {
          console.log('Transaction submitted:', data)
          setProcessing(false)
          setWaitingForConfirmation(true) // Show spinner while waiting for confirmation
          
          // Wait for transaction to be confirmed before refreshing
          // Stacks blocks are mined approximately every 10 minutes
          // We'll check multiple times with increasing delays
          const checkTransaction = async (txId, retries = 0) => {
            if (retries >= 12) {
              // After 2 minutes, just refresh anyway
              console.log('Max retries reached, refreshing counter')
              setWaitingForConfirmation(false)
              onUpdate()
              return
            }
            
            try {
              const apiUrl = network.coreApiUrl || 'https://api.hiro.so'
              const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`)
              const txData = await response.json()
              
              if (txData.tx_status === 'success' || txData.tx_status === 'abort_by_response') {
                console.log('Transaction confirmed:', txData.tx_status)
                // Wait a bit more for the state to be updated
                setTimeout(() => {
                  setWaitingForConfirmation(false)
                  onUpdate()
                }, 2000)
              } else if (txData.tx_status === 'pending') {
                // Still pending, check again in 10 seconds
                console.log(`Transaction pending, checking again in 10s (attempt ${retries + 1}/12)`)
                setTimeout(() => checkTransaction(txId, retries + 1), 10000)
              } else {
                // Transaction failed or other status
                console.log('Transaction status:', txData.tx_status)
                setWaitingForConfirmation(false)
                setTimeout(() => {
                  onUpdate()
                }, 2000)
              }
            } catch (err) {
              console.error('Error checking transaction:', err)
              // If we can't check, just refresh after a delay
              setWaitingForConfirmation(false)
              setTimeout(() => {
                onUpdate()
              }, 15000)
            }
          }
          
          if (data.txId) {
            // Start checking transaction status
            setTimeout(() => checkTransaction(data.txId), 5000)
          } else {
            // Fallback: just refresh after delay
            setWaitingForConfirmation(false)
            setTimeout(() => {
              onUpdate()
            }, 15000)
          }
        },
        onCancel: () => {
          console.log('Transaction cancelled')
          setProcessing(false)
          setWaitingForConfirmation(false)
        },
        onError: (error) => {
          console.error('Transaction error:', error)
          alert('Transaction failed: ' + (error.message || 'Unknown error. Make sure the contract has been redeployed with the new functions.'))
          setProcessing(false)
          setWaitingForConfirmation(false)
        },
      })
    } catch (err) {
      console.error('Error calling contract:', err)
      alert('Failed to execute transaction: ' + err.message)
      setProcessing(false)
      setWaitingForConfirmation(false)
    }
  }

  return (
    <div className="counter">
      <div className="counter-display">
        <h2>Current Counter Value</h2>
        {(loading || waitingForConfirmation) ? (
          <div className="loading">
            <div className="spinner" aria-label="Loading counter value" />
            <span className="loading-text">
              {waitingForConfirmation ? 'Waiting for blockchain confirmation...' : 'Updating on-chain value…'}
            </span>
          </div>
        ) : (
          <div className="counter-value">
            {counterValue !== null && !isNaN(counterValue) ? counterValue : 0}
          </div>
        )}
      </div>

      <div className="custom-card">
        <div className="pane inc">
          <h3>Increment by Amount</h3>
          <div className="pane-input-group">
            <input
              type="number"
              min="1"
              value={incrementAmount}
              onChange={(e) => setIncrementAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={processing || waitingForConfirmation || !isSignedInSafe()}
              className="pane-input"
            />
            <button
              onClick={() => handleContractCall('increment-by', incrementAmount)}
              disabled={processing || waitingForConfirmation || !isSignedInSafe()}
              className="btn-action btn-pane-inc"
            >
              ➕ Add {incrementAmount || '0'}
            </button>
          </div>
        </div>
        <div className="pane dec">
          <h3>Decrement by Amount</h3>
          <div className="pane-input-group">
            <input
              type="number"
              min="1"
              value={decrementAmount}
              onChange={(e) => setDecrementAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={processing || waitingForConfirmation || !isSignedInSafe()}
              className="pane-input"
            />
            <button
              onClick={() => handleContractCall('decrement-by', decrementAmount)}
              disabled={processing || waitingForConfirmation || !isSignedInSafe()}
              className="btn-action btn-pane-dec"
            >
              ➖ Subtract {decrementAmount || '0'}
            </button>
          </div>
        </div>
      </div>

      <div className="counter-actions">
        <button
          onClick={() => handleContractCall('increment')}
          disabled={processing || waitingForConfirmation || !isSignedInSafe()}
          className="btn-action btn-increment"
        >
          ➕ Increment (+1)
        </button>
        <button
          onClick={() => handleContractCall('decrement')}
          disabled={processing || waitingForConfirmation || !isSignedInSafe()}
          className="btn-action btn-decrement"
        >
          ➖ Decrement (-1)
        </button>
        <button
          onClick={() => handleContractCall('reset')}
          disabled={processing || waitingForConfirmation || !isSignedInSafe()}
          className="btn-action btn-reset"
        >
          🔄 Reset to 0
        </button>
      </div>

      {processing && (
        <div className="processing">
          Processing transaction... Please confirm in your wallet.
        </div>
      )}

      {waitingForConfirmation && (
        <div className="processing">
          <div className="spinner-small"></div>
          Transaction submitted! Waiting for blockchain confirmation...
        </div>
      )}

      {!processing && counterValue === 0 && (
        <div className="info" style={{ marginTop: '10px' }}>
          💡 Tip: After incrementing, wait a few seconds and click "Refresh Counter" to see the updated value
        </div>
      )}

      {!isSignedInSafe() && (
        <div className="info">
          Connect your wallet to interact with the counter
          <div style={{ marginTop: '10px' }}>
            <button onClick={resetSession} className="btn-action btn-reset">Reset Session</button>
          </div>
        </div>
      )}

      <button
        onClick={onUpdate}
        disabled={loading || waitingForConfirmation}
        className="btn-refresh"
        style={{ marginTop: '20px', padding: '10px 20px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
      >
        🔄 Refresh Counter
      </button>
    </div>
  )
}
