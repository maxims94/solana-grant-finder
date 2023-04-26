import { useState, useCallback } from 'react';
import { Grant } from '../types/Grant'
import styles from '../styles/Home.module.css'

const cosineSimilarity = require('compute-cosine-similarity')

interface GrantResult {
  relevance: number, // [0,1]
  id: string,
  name: string,
  icon_path: string,
  description: string,
  link: string,
  org_name: string,
  org_link: string, 
}

export default function GrantSearch({ data, titleFont, textFont }: { data: Grant[], titleFont: any, textFont: any }) {
  
  const [query, setQuery] = useState('');
  
  const [grantResults, setGrantResults] = useState<GrantResult[]>([]);

  const onSubmit = (event: any) => {
      event.preventDefault()
      
      console.log("submit")
      
      const query = event.target.query.value;
      
      (async() => {

        const result = await fetch('/api/get_embedding', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({query})
        })
        
        const resultData = await result.json()
        
        const queryEmbedding = resultData.embedding
        
        console.log("Embedding of query:", queryEmbedding)
        
        // TODO: prefilter based on RFP/ Grant setting

        const intermediary = data.map(item => [
          cosineSimilarity(queryEmbedding, item.embedding), item
        ]).sort((a, b) => b[0] - a[0])

        // normalize relevance
        const maxRelevance = intermediary[0][0]
        const minRelevance = intermediary[intermediary.length - 1][0]
        const relevanceRange = maxRelevance - minRelevance
        
        console.log("Unnormalized relevance:", intermediary.map(x => x[0]))

        const normalized = intermediary.map(([relevance, item]) => ([
          (relevance - minRelevance) / relevanceRange,
          item
        ]))
        
        const results = normalized.map(([relevance, item]) => ({
          relevance,
          id: item.id,
          name: item.name,
          icon_path: item.icon_path,
          description: item.description,
          link: item.link,
          org_name: item.org_name,
          org_link: item.org_link,
        }))
         
        setGrantResults(results)

      })().catch((error: any) => {
        console.error(error)
        // TODO: result data? set status = error?
      })
      
  }

  return (

    <div className={styles.GrantSearch}>
      <h1 className={titleFont.className}>Explore Grants</h1>

      <div className={textFont.className}>
        <form className={styles.GrantSearchForm} onSubmit={onSubmit}>
          <div className={styles.GrantSearchFormRow} style={{marginBottom: '50px'}}>
            <label>
              <span className={styles.FormLabel}>Search:</span>
              <input type="text" name="query" defaultValue="nft marketplace" className={styles.QueryInput}/>
            </label>
            <input type="submit" value="Search" />
          </div>

          <div className={styles.GrantSearchFormRow}>
            <label>
              <span className={styles.FormLabel}>Type:</span>
              <input className={styles.CheckboxInput} type="checkbox" name="type[]" /> <span className={styles.CheckboxOption}>RFP</span>
              <input className={styles.CheckboxInput} type="checkbox" name="type[]" /> <span className={styles.CheckboxOption}>Grant</span>
            </label>
          </div>
        </form>
      </div>

      <div className={textFont.className}>
        <div className={styles.GrantSearchResultsContainer}>
          {
            grantResults.map((grant: GrantResult) => {
              return (
                <div className={styles.GrantSearchResult} key={grant.id}>
                  <div>{Math.floor(grant.relevance * 100)}%</div>
                  <div>{grant.name}</div>
                  <div>{grant.org_name}</div>
                  <div>v</div>
                </div>
              )
            })
          }
        </div>
      </div>

    </div>
  )
}