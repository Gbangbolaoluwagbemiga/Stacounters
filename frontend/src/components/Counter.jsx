import { useState } from 'react'
import { openContractCall } from '@stacks/connect'
import './Counter.css'

export default function Counter({ contractAddress, contractName, network, userSession, counterValue, loading, onUpdate }) {
  const [processing, setProcessing] = useState(false)

  const handleContractCall = async (functionName) => {
    if (!userSession.isUserSignedIn()) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setProcessing(true)
      const functionArgs = []
      
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
            {counterValue !== null && !isNaN(counterValue) ? counterValue : '--'}
          </div>
        )}
      </div>

      <div className="counter-actions">
        <button
          onClick={() => handleContractCall('increment')}
          disabled={processing || !userSession.isUserSignedIn()}
          className="btn-action btn-increment"
        >
          ➕ Increment
        </button>
        <button
          onClick={() => handleContractCall('decrement')}
          disabled={processing || !userSession.isUserSignedIn()}
          className="btn-action btn-decrement"
        >
          ➖ Decrement
        </button>
        <button
          onClick={() => handleContractCall('reset')}
          disabled={processing || !userSession.isUserSignedIn()}
          className="btn-action btn-reset"
        >
          🔄 Reset
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

