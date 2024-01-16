import React from 'react';
import './search.style.scss';
import magnifyGlass from '../../assets/svgs/magniy_glass_icon.svg';
import location from '../../assets/svgs/location_icon.svg';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateCountry,
  updateQ,
  updateCounty,
  updatCity
} from '../../state/query.slice';
import { getAllJobs, getTotalRomania } from '../../utils/get-data';
import { updateAllJobs, updateTotalRomania } from '../../state/jobs.slice';
import { counties } from './cityandcounty';
import {
  searchLocation,
  searchMunicipiu,
  removeDuplicates
} from '../../utils/advanced-search';
import { v4 as uuidv4 } from 'uuid';

// Transform counties object to array
const counties_list = counties.map((county) => {
  return Object.keys(county)[0];
});

export const Search = (props) => {
  // Props
  const queries = props.queries;
  const handleClick = props.handleClick;

  // Redux
  const dispatch = useDispatch();
  const q = useSelector((state) => state.query.q);
  const country = useSelector((state) => state.query.country);
  const county = useSelector((state) => state.query.county);

  // States
  const [countiesList, setCountiesList] = React.useState([counties_list]);
  const [citiesList, setCitiesList] = React.useState([]);
  const [advancedSearchQuerry, setAdvancedSearchQuerry] = React.useState('');
  const [data, setData] = React.useState([]);
  const [uniqueResults, setUniqueResults] = React.useState([]);

  React.useEffect(() => {
    if (country === 'România') {
      setCountiesList(counties_list);
    } else {
      setCountiesList(['Toate']);
    }
  }, [country]);

  React.useEffect(() => {
    if (county) {
      setCitiesList([]);
      counties.forEach((c) => {
        if (Object.keys(c)[0] === county) {
          setCitiesList(c[county]);
        }
      });
    }
  }, [county]);

  React.useEffect(() => {
    getData();
  }, []);

  // Functions
  // Update query search
  const updateQuerySearch = (e) => {
    dispatch(updateQ(e.target.value));
  };

  // Update country search
  const updateCountrySearch = (e) => {
    if (e.target.value) {
      getTotalRomania().then((totalRomania) => {
        dispatch(updateTotalRomania(totalRomania));
      });
    } else {
      getAllJobs().then((totalRomania) => {
        dispatch(updateAllJobs(totalRomania));
      });
    }
    dispatch(updateCountry(e.target.value));
    dispatch(updatCity(''));
    dispatch(updateCounty(''));
  };

  // Update county search
  const updateCountySearch = (e) => {
    dispatch(updateCounty(e.target.value));

    /* updates the list of counties displayed based on user input.
    / It filters the counties to show only those that match the search criteria provided by the user.
    */

    setCountiesList(
      counties_list.filter((c) => {
        return c.toLowerCase().includes(e.target.value.toLowerCase());
      })
    );
  };

  // Update city search
  /*const updateCitySearch = (e) => {
    dispatch(updatCity(e.target.value));

    // updates the list of cities displayed based on user input for a specific county.
    // It filters the cities to show only those that match the search criteria provided by the user.
    counties.forEach((elem) => {
      if (Object.keys(elem)[0] === county) {
        setCitiesList(
          elem[county].filter((city) => {
            return city.toLowerCase().includes(e.target.value.toLowerCase());
          })
        );
      }
    });
  }; */

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleClick();
  };

  // Handle clear X
  const handleClearX = (e) => {
    e.preventDefault();
    dispatch(updateQ(''));
  };

  // Handle click input
  const handleClickInput = (e) => {
    /*
    / get the list of options for the input that was clicked
    */

    // Select the list of ul options
    const dataList = e.target.nextElementSibling;

    // Add event listener to the list of options
    dataList.addEventListener('click', (d) => {
      // Update the value of the input with the selected option
      e.target.value = d.target.getAttribute('data');
      switch (e.target.id) {
        case 'country':
          dispatch(updateCountry(e.target.value));
          dispatch(updateCounty(''));
          dispatch(updatCity(''));
          if (e.target.value === 'România') {
            setInputs(2);
          }
          break;
        case 'county':
          dispatch(updateCounty(e.target.value));
          dispatch(updatCity(''));
          if (e.target.value) {
            setInputs(3);
          }
          break;
        case 'city':
          dispatch(updatCity(e.target.value));
          break;
        default:
          break;
      }
    });
  };

  //ADVANCED SEARCH FUNCTIONS
  //************************ */
  async function getData() {
    try {
      const response = await fetch(`https://orase.peviitor.ro/`);
      const data = await response.json();
      console.log(data.judet);
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const handleLiClick = (e) => {
    // searchInput.innerHTML = "";
    const selectedLocationId = e.target.id;
    console.log('Id-ul locatiei:', selectedLocationId);
    const selectedLocation = uniqueResults.filter(
      (result) => result.id === selectedLocationId
    );
    console.log('Locatia selectata:', selectedLocation);
    dispatch(updateCounty(selectedLocation.judet));
    dispatch(updatCity(selectedLocation.parent));
    //searchInput.value = selectedLocation;
    //searchResultsContainer.classList.remove('searchResults-display');
    //searchResultsContainer.innerHTML = '';
  };

  const onChangeInput = (e) => {
    // Start the search after at least 3 letters
    if (e.target.value.length >= 3) {
      setAdvancedSearchQuerry(e.target.value);
      const searchResult = searchLocation(advancedSearchQuerry, data.judet);
      const searchResultBucuresti = searchMunicipiu(
        e.target.value,
        data.municipiu
      );
      // Check if there are any matching results
      if (searchResult || searchResultBucuresti) {
        const uniqueResults = removeDuplicates(searchResult);
        uniqueResults.forEach((result) => {
          result.id = uuidv4();
        });
        if (searchResultBucuresti) uniqueResults.push(...searchResultBucuresti);
        setUniqueResults(uniqueResults);
        // displayResults(uniqueResults, searchResultBucuresti);
      } else {
        // displayResults([]);
      }
    } else {
      // Display a message when less than 3 letters are entered
      // searchResultsContainer.classList.add('searchResults-display');
      // searchResultsContainer.innerHTML =
      // '<p>Introdu minim 3 litere ca sa poata functiona searchul</p>';
    }
    // Clear results when the search input is empty
    if (e.target.value.length < 1) {
      // searchResultsContainer.classList.remove('searchResults-display');
      // searchResultsContainer.innerHTML = '';
    }
  };

  // Handle click input
  const [inputs, setInputs] = React.useState(1);

  const ref = React.useRef(false);

  const [show, setShow] = React.useState(false);

  document.addEventListener('click', (e) => {
    try {
      if (
        e.target.childNodes[2] === ref.current ||
        e.target.parentNode.childNodes[2] === ref.current
      ) {
        setShow(true);
      } else {
        setShow(false);
      }
    } catch (e) {}
  });

  return (
    <form onSubmit={handleSubmit} className="search">
      <div className="inputs-wrapper">
        <div className="input-container">
          <img src={magnifyGlass} alt="magnify glass icon" />
          <input
            autoFocus
            placeholder="Ce doriți să lucrați?"
            onChange={updateQuerySearch}
            value={q}
          />
          {q && (
            <span className="clear" onClick={handleClearX}>
              <svg
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
            </span>
          )}
        </div>
        <div className="option-container ">
          {inputs === 1 ? (
            <div className="country query">
              <img src={location} alt="location icon" />
              <input
                type="text"
                id="country"
                placeholder="Țara"
                autoComplete="off"
                value={country}
                onChange={updateCountrySearch}
                onClick={handleClickInput}
              />

              <ul
                name="country"
                value={country}
                className={show ? '' : 'hide'}
                ref={ref}
              >
                <li data="România">România</li>
                <li data="">Toate</li>
              </ul>
              {country ? (
                <span
                  className="clear"
                  onClick={() => {
                    dispatch(updateCountry(''));
                    dispatch(updateCounty(''));
                    dispatch(updatCity(''));
                    setInputs(1);
                  }}
                >
                  <svg
                    focusable="false"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </span>
              ) : null}
            </div>
          ) : null}
          {country === 'România' && inputs === 2 ? (
            <div className="county query">
              <img src={location} alt="location icon" />
              <input
                id="county"
                className="searchInp"
                type="text"
                placeholder="Județul"
                autoComplete="off"
                onChange={onChangeInput}
                onClick={handleClickInput}
              />
              <ul
                name="county"
                ref={ref}
                className={show ? 'searchResults' : 'hide searchResults'}
                value={queries.county ? queries.county : ''}
              >
                <li data="">Alege orasul</li>
                {uniqueResults?.map((result, index) => {
                  return (
                    <li key={index} id={result.id} onClick={handleLiClick}>
                      {result?.query}, {result?.judet} {result?.parent}
                    </li>
                  );
                })}
              </ul>

              <span
                className="clear"
                onClick={() => {
                  dispatch(updateCountry(''));
                  dispatch(updateCounty(''));
                  dispatch(updatCity(''));
                  setInputs(1);
                }}
              >
                <svg
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <button type="submit" className="btn-yellow btn">
        Caută
      </button>
    </form>
  );
};
