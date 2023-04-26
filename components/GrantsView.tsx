import { useState, useCallback } from 'react';
import { Grant } from '../types/Grant'

export default function GrantsView({ data }: { data: Grant[] }) {
  
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const onNameFilterChange = (event: any) => {
      setNameFilter(event.target.value)
  }

  const onCategoryFilterChange = (event: any) => {
      setCategoryFilter(event.target.value)
  }

  const filteredData = data.filter((grant: Grant) => {
    if(nameFilter !== ''){
      if (!grant.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        return false
      }
    }
    
    if(categoryFilter.length > 0){
      // OR logic for categories
      if (!grant.category.some((category: string) => categoryFilter.includes(category))) {
        return false
      }
    }
    
    return true
  })
  
  const sortedData = filteredData.sort((a: Grant, b: Grant) => {

    if (sortKey == 'name') {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    return 0
  })


  return (
    <div>
      <div>
        <h2>Filter options</h2>
        <form>
          <label>
            Search:
            <input type="text" name="nameFilter" onChange={onNameFilterChange}/>
          </label>
          <label>
            Category:
            <select name="category" id="category" onChange={onCategoryFilterChange} multiple={true} defaultValue={[]}>
              <option value="DeFi">DeFi</option> 
              <option value="NFT">NFT</option>
              <option value="Gaming">Gaming</option>
              <option value="Social">Social</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </label>
        </form>
      </div>
      
      <div>
        <h2>Results</h2>
        {
          sortedData.map((grant: Grant) => {
            return (
              <div key={grant.id}>
                <h3>{grant.name}</h3>
                <p>Category: {grant.category.join(', ')}</p>
                <p>RFP: {grant.rfp ? 'Yes' : 'No'}</p>
              </div>
            )
          })
        }
      </div>
    </div>
  )

}