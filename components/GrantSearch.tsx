import { useState, useCallback, useRef } from 'react';
import { Grant } from '../types/Grant'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

import searchIcon from '../public/search-icon.svg'

import arrowDown from '../public/arrow-down.svg'
import { Grand_Hotel } from 'next/font/google';

const cosineSimilarity = require('compute-cosine-similarity')

interface GrantResult {
  relevance: number | null, // [0,1]
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
  
  const [grantResultsExpand, setGrantResultExpand] = useState<boolean[]>([]);
  
  const isRFPChecked = useRef(true);
  const isGrantChecked = useRef(true);
  
  const isFirst = useRef(true);

  const onSubmit = (event: any) => {
    event.preventDefault !== undefined && event.preventDefault()

    console.log("submit")

    const query = event.target.query.value;

    if (query === '') {
      const results: GrantResult[] = data.map(item => ({
        relevance: null,
        id: item.id,
        name: item.name,
        icon_path: item.icon_path,
        description: item.description,
        link: item.link,
        org_name: item.org_name,
        org_link: item.org_link
      }))

      results.sort((a, b) => (a.org_name + a.name).localeCompare(b.org_name + b.name))

      setGrantResults(results)
      setGrantResultExpand(Array(results.length).fill(false))
      return
    }

    (async () => {

      const result = await fetch('/api/get_embedding', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      const resultData = await result.json()

      const queryEmbedding = resultData.embedding

      console.log("Embedding of query:", queryEmbedding)

      // TODO: prefilter based on RFP/ Grant setting
      const intermediary = data.map(item => [
        cosineSimilarity(queryEmbedding, item.embedding), item
      ]).sort((a, b) => b[0] - a[0])

      /*
      // normalize relevance
      const maxRelevance = intermediary[0][0]
      const minRelevance = intermediary[intermediary.length - 1][0]
      const relevanceRange = maxRelevance - minRelevance

      console.log("Unnormalized relevance:", intermediary.map(x => x[0]))

      const normalized = intermediary.map(([relevance, item]) => ([
        (relevance - minRelevance) / relevanceRange,
        item
      ]))
      */

      const normalized = intermediary

      const results = normalized.map(([relevance, item]) => ({
        relevance,
        id: item.id,
        name: item.name,
        icon_path: item.icon_path,
        description: item.description,
        link: item.link,
        org_name: item.org_name,
        org_link: item.org_link,
      })).filter(x => x.relevance > 0.1)

      setGrantResults(results)
      setGrantResultExpand(Array(results.length).fill(false))
    })().catch((error: any) => {
      console.error(error)
      // TODO: result data? set status = error?
    })

  }
  
  const expandGrantResult = useCallback((id: string) => () => {
    // get index of grant result
    const index = grantResults.findIndex(x => x.id === id)
    if (index === -1) {
      return
    } else {
      const newGrantResultExpand = [...grantResultsExpand]
      newGrantResultExpand[index] = !newGrantResultExpand[index]
      setGrantResultExpand(newGrantResultExpand)
    }
  }, [grantResultsExpand, grantResults])
  
  if(isFirst.current) {
    isFirst.current = false;
    onSubmit({target: {query: {value: ''}}})
  }

  return (

    <div className={styles.GrantSearch}>
      <div className={styles.GrantSearchInner}>
        <h1 className={titleFont.className}>Explore Grants</h1>

        <div className={textFont.className}>
          <form className={styles.GrantSearchForm} onSubmit={onSubmit}>
            <div className={styles.GrantSearchFormRow} style={{ marginBottom: '15px' }}>
              <span className={styles.FormLabel}>Search:</span>
              <input type="text" name="query" className={styles.QueryInput} />
              <button type="submit" className={styles.SearchButton}>
                <Image src={searchIcon} alt="Search" width={25} height={25} />
              </button>
            </div>

            <div className={styles.GrantSearchFormRow} style={{ marginBottom: '50px', fontSize: '12pt', color: '#838383' }}>
              e.g. “nft marketplace”, “hard dev problem”, “community project europe”, “writing defi”, “solana pay”<br />Leave empty to show all
            </div>

            <div className={styles.GrantSearchFormRow} style={{ marginBottom: '15px' }}>
              <span className={styles.FormLabel}>Type:</span>
              <input className={styles.CheckboxInput} type="checkbox" name="type[]" defaultChecked onChange={() => isRFPChecked.current = !isRFPChecked.current}/>
               <span className={styles.CheckboxOption}>RFP</span>
              <input className={styles.CheckboxInput} type="checkbox" name="type[]" defaultChecked onChange={() => isGrantChecked.current = !isGrantChecked.current}/>
              <span className={styles.CheckboxOption}>Grant</span>
            </div>

            <div className={styles.GrantSearchFormRow} style={{ fontSize: '12pt', color: '#838383' }}>
              Looking for an idea? Make sure to check RFP (Request for Proposal)!
            </div>
          </form>
        </div>

        <div className={textFont.className}>
          {
            grantResults.map((grant: GrantResult) => {
              
              const grantIndex = grantResults.findIndex(x => x.id === grant.id)
              
              return (
                <>
                <div className={styles.GrantSearchResult} key={grant.id}>
                  {
                    grant.relevance !== null ?
                    <div className={styles.GrantSearchResultProgress}>{Math.floor(grant.relevance * 100)}%</div>:
                    ""
                  }
                  <div className={styles.GrantSearchResultName}><a href={grant.link} target="_blank">{grant.name}</a></div>
                  <div className={styles.GrantSearchResultOrgName}><a href={grant.org_link} target="_blank">{grant.org_name}</a></div>
                  <div className={styles.GrantSearchResultExpand} onClick={expandGrantResult(grant.id)}>
                    <Image src={arrowDown} alt="Expand" width={28} height={36} style={{ transform: grantResultsExpand[grantIndex] ? 'rotate(180deg)' : ''}}/>
                  </div>
                </div>
                {
                  grantResultsExpand[grantIndex] ?
                  <div className={styles.GrantSearchResultDescription} key={grant.id + "desc"}>{grant.description}</div> :
                  ""
                }
                </>
              )
            })
          }
        </div>
      </div>

    </div>
  )
}