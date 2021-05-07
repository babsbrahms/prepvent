import React, { Component } from 'react'
import { Search } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { searchEvent } from '../../actions/event'


export default class SearchEvent extends Component {
  state = { 
      isLoading: false, 
      results: [], 
      value: '',
      searchedVal: '',
      _id: ''
    }

  handleResultSelect = (e, { result }) => this.setState({ _id: result._id }, () => {
      document.getElementById('searchlink').click();
      this.props.closeSearch();
  })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value }, () => {
        if (value.length > 0) {
            setTimeout(() => {
                if (this.state.searchedVal !== this.state.value) {
                    this.setState({ searchedVal: this.state.value })
                    searchEvent(this.state.value)
                    .then((res) => {
                        let results = res.data.results.map(data =>({
                            "title": data.name,
                            "description": data.time.startStr,
                            // "image": data.poster,
                            '_id': data._id
            
                        }))
                      this.setState({
                          isLoading: false,
                          results: results,
                      })
                    })
                    .catch(() => {
                      this.setState({
                          isLoading: false,
                          results: [],
                      })
                    })
                }
            }, 3000)
          } else {
            this.setState({ isLoading: false, results: [], value: ''  })
          }
    })

  }

  render() {
    const { isLoading, value, results, _id } = this.state

    return (
        <div>
            <div style={{ height: '0px', width: '0px' }}>
                <Link id={'searchlink'} to={`/e/${_id}`}></Link>

            </div>
            <Search
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={this.handleSearchChange}
            results={results}
            value={value}
            fluid
            {...this.props}
          />
        </div>

    )
  }
}