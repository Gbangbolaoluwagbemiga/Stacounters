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
        onFinish: (data) => {
          console.log('Transaction submitted:', data)
          // Wait for transaction to be confirmed before refreshing
          setTimeout(() => {
            onUpdate()
          }, 5000)
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

