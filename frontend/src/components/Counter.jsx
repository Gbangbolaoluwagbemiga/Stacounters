import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import { uintCV } from '@stacks/transactions'
import './Counter.css'

export default function Counter({ contractAddress, contractName, network, userSession, counterValue, loading, onUpdate }) {
  const [processing, setProcessing] = useState(false)
  const [incrementAmount, setIncrementAmount] = useState('1')

  const handleContractCall = async (functionName, amount = null) => {
    if (!userSession.isUserSignedIn()) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setProcessing(true)
      const functionArgs = []
      
      // If amount is provided, use increment-by function
      if (amount !== null) {
        const numAmount = parseInt(amount, 10)
        if (isNaN(numAmount) || numAmount <= 0) {
          alert('Please enter a valid positive number')
          setProcessing(false)
          return
        }
        functionName = 'increment-by'
        functionArgs.push(uintCV(numAmount))
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
          
          // Wait for transaction to be confirmed before refreshing
          // Stacks blocks are mined approximately every 10 minutes
          // We'll check multiple times with increasing delays
          const checkTransaction = async (txId, retries = 0) => {
            if (retries >= 12) {
              // After 2 minutes, just refresh anyway
              console.log('Max retries reached, refreshing counter')
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
                  onUpdate()
                }, 2000)
              } else if (txData.tx_status === 'pending') {
                // Still pending, check again in 10 seconds
                console.log(`Transaction pending, checking again in 10s (attempt ${retries + 1}/12)`)
                setTimeout(() => checkTransaction(txId, retries + 1), 10000)
              } else {
                // Transaction failed or other status
                console.log('Transaction status:', txData.tx_status)
                setTimeout(() => {
                  onUpdate()
                }, 2000)
              }
            } catch (err) {
              console.error('Error checking transaction:', err)
              // If we can't check, just refresh after a delay
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
            setTimeout(() => {
              onUpdate()
            }, 15000)
          }
        },
        onCancel: () => {
          console.log('Transaction cancelled')
          setProcessing(false)
        },
        onError: (error) => {
          console.error('Transaction error:', error)
          alert('Transaction failed: ' + (error.message || 'Unknown error. Make sure the contract has been redeployed with the new functions.'))
          setProcessing(false)
        },
      })
    } catch (err) {
      console.error('Error calling contract:', err)
      alert('Failed to execute transaction: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="counter">
      <div className="counter-display">
        <h2>Current Counter Value</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="counter-value">
            {counterValue !== null && !isNaN(counterValue) ? counterValue : 0}
          </div>
        )}
      </div>

      <div className="increment-custom">
        <h3>Increment by Custom Amount</h3>
        <div className="increment-input-group">
          <input
            type="number"
            min="1"
            value={incrementAmount}
            onChange={(e) => setIncrementAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={processing || !userSession.isUserSignedIn()}
            className="increment-input"
          />
          <button
            onClick={() => handleContractCall('increment-by', incrementAmount)}
            disabled={processing || !userSession.isUserSignedIn()}
            className="btn-action btn-increment-custom"
          >
            ➕ Add {incrementAmount || '0'}
          </button>
        </div>
      </div>

      <div className="counter-actions">
        <button
          onClick={() => handleContractCall('increment')}
          disabled={processing || !userSession.isUserSignedIn()}
          className="btn-action btn-increment"
        >
          ➕ Increment (+1)
        </button>
        <button
          onClick={() => handleContractCall('decrement')}
          disabled={processing || !userSession.isUserSignedIn()}
          className="btn-action btn-decrement"
        >
          ➖ Decrement (-1)
        </button>
        <button
          onClick={() => handleContractCall('reset')}
          disabled={processing || !userSession.isUserSignedIn()}
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

      {!processing && counterValue === 0 && (
        <div className="info" style={{ marginTop: '10px' }}>
          💡 Tip: After incrementing, wait a few seconds and click "Refresh Counter" to see the updated value
        </div>
      )}

      {!userSession.isUserSignedIn() && (
        <div className="info">
          Connect your wallet to interact with the counter
        </div>
      )}

      <button
        onClick={onUpdate}
        disabled={loading}
        className="btn-refresh"
        style={{ marginTop: '20px', padding: '10px 20px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
      >
        🔄 Refresh Counter
      </button>
    </div>
  )
}

