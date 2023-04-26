import Head from 'next/head'
import GrantSearch from '../components/GrantSearch'
import Airtable from 'airtable';
import { Configuration, OpenAIApi } from "openai";

import styles from '../styles/Home.module.css'

import { Grant } from '@/types/Grant';

export default function Home({ data }: { data: Grant[]}) {
  return (
    <>
      <div className={styles.Container}>
        <div className={styles.Header}>
          <h1>Solana Grant Finder</h1>
          <h1>Building on Solana?</h1>
          <h1>Get paid!</h1>
        </div>
          
        <GrantSearch data={data}/>

        <div className={styles.Footer}>
          Copyright by Grant Finder
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  
  console.log("Load Airtable data")
  
  if(
    !process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ||
    !process.env.AIRTABLE_BASE_ID ||
    !process.env.AIRTABLE_GRANTS_TABLE_ID
  ) 
    throw new Error("Missing Airtable credentials")

  const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN as string}).base(process.env.AIRTABLE_BASE_ID as string);
  const table = base(process.env.AIRTABLE_GRANTS_TABLE_ID as string)
  
  let result;

  try {
    result = await table.select().all()
  } catch(error: any) {
    console.error("Couldn't retrieve Airtable data:", error)
    throw new Error(error)
  }

  console.log("Number of records: ", result.length)
  
  const data: Grant[] = []

  for(const record of result) {
    data.push({
      id: record.id,
      name: record.get('Name') as string,
      icon_path: null,
      //TODO
      //icon_path: record.get('Icon') as string,
      description: record.get('Description') as string,
      is_rfp: Boolean(record.get('RFP')),
      link: record.get('Link') as string,
      document: record.get('Document') as string,
      org_name: record.get('Organization name') as string,
      org_link: record.get('Organization link') as string,
      embedding: null
    })
  }
  
  console.log("Request embedding...")
  
  if(!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key")
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const embedding = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: data.map(item => item.document),
  })

  console.log("Done")
  
  embedding.data.data.forEach((item, index) => {
    data[index].embedding = item.embedding
  })
  
  //console.log(data)
  
  return {
    props: { data: data }
  }
}