import { useState, useCallback } from 'react';
import { Grant } from '../types/Grant'
import styles from '../styles/Home.module.css'

interface GrantResult {
  
}

export default function GrantSearch({ data }: { data: Grant[] }) {
  
  const [query, setQuery] = useState('');
  
  const [resultData, setResultData] = useState<GrantResult[]>([]);

  const onSubmit = (event: any) => {
      event.preventDefault()
      
      console.log("submit")
  }

  return (

    <div className={styles.GrantSearch}>
      <h1>Explore Grants</h1>

      <form className={styles.GrantSearchForm} onSubmit={onSubmit}>
        <div className={styles.GrantSearchFormRow}>
          <label>
            SEARCH:
            <input type="text" name="query" defaultValue="nft marketplace"/>
          </label>
          <input type="submit" value="Search" />
        </div>

        <div className={styles.GrantSearchFormRow}>
          <label>
            Type:
            <input type="checkbox" name="type" /> RFP
            <input type="checkbox" name="type" /> Grant
          </label>
        </div>
      </form>
      
      <div className={styles.GrantSearchResultsContainer}>
        {
          resultData.map((grant: GrantResult) => {
            return (
              <p>test</p>
            /*
              <div className={styles.GrantSearchResult} key={grant.id}>
                <h3>{grant.name}</h3>
                <p>Category: {grant.category.join(', ')}</p>
                <p>RFP: {grant.rfp ? 'Yes' : 'No'}</p>
              </div>
              */
            )
          })
        }
      </div>

    </div>
  )
}