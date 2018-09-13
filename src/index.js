import React from 'react';
import ReactDOM from 'react-dom';
import './Index.css';
import WEATHER_KEY from './config';
const url = 'http://api.openweathermap.org/data/2.5/weather?q=';

// const Context = React.createContext();

const WeatherListItem = props => {
  const handleClick = (zip, e) => {
    if (zip === props.selectedItem) {
      props.setZip('');
      e.target.classList.remove('selected');
    } else if (zip !== props.selectedItem) {
      props.setZip(zip);
      document.querySelectorAll('.selected').forEach(item => {
        item.classList.remove('selected');
      });
      e.target.classList.add('selected');
    }
  };
  const { zipcode, temp } = props;
  return (
    <li onClick={handleClick.bind(this, zipcode)}>
      Zipcode: {zipcode}, Weather: {temp}˚
    </li>
  );
};

const WeatherList = props => {
  const handleClick = e => {};
  return props.weatherData.map(item => (
    <WeatherListItem
      key={item.id}
      zipcode={item.zip}
      temp={item.temp}
      setZip={props.setZip}
      selectedItem={props.selectedItem}
    />
  ));
};

const Input = props => {
  const handleInputChange = e => {
    if (
      e.nativeEvent.inputType === 'deleteContentBackward' &&
      e.target.value === ''
    ) {
      props.clearSelected();
    }
    if (
      props.zipcode.length < 8 ||
      e.nativeEvent.inputType === 'deleteContentBackward'
    ) {
      props.onInputChange(e.target.value);
    }
    if (
      e.nativeEvent.inputType === 'deleteContentBackward' &&
      props.zipcode.length === 0
    ) {
      props.clearSelected();
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (props.zipcode === props.selectedItem) {
      alert('Zipcode already saved');
      props.clearInput();
      props.clearSelected();
    } else if (props.zipcode.length === 5 && props.zipcode === '') {
      props.getWeather();
      props.clearInput();
      props.clearSelected();
    } else if (props.zipcode.length === 5 && props.zipcode !== '') {
      props.getWeather();
      props.deleteZip();
      props.clearInput();
      props.clearSelected();
      console.log('delete and add');
    }
  };

  const handleFocus = e => {
    e.target.select();
  };

  return (
    <div>
      <form type="submit" onSubmit={handleSubmit}>
        <input
          className="form-items input"
          placeholder="Enter zipcode"
          value={props.zipcode}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />
        <button className="form-items button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

class WeatherForm extends React.Component {
  state = {
    zipcode: '',
    weatherData: [],
    selectedItem: null
  };

  // weatherData = [
  // { id: 1, zip: 92691, temp: 75 },
  // { id: 2, zip: 94116, temp: 62 },
  // { id: 3, zip: 93006, temp: 70 },
  // { id: 4, zip: 12345, temp: 80 }
  // ];

  componentDidMount() {
    if (localStorage.getItem('weather-data')) {
      this.setState({
        weatherData: JSON.parse(localStorage.getItem('weather-data'))
      });
    }
  }

  onClick = () => {
    alert('hello');
  };

  handleInputChange = value => {
    this.setState({
      zipcode: value
    });
  };

  clearInput = () => {
    this.setState({
      zipcode: ''
    });
  };

  setZip = zip => {
    this.setState({
      zipcode: zip,
      selectedItem: zip
    });
  };

  clearSelected = () => {
    document.querySelectorAll('.selected').forEach(item => {
      item.classList.remove('selected');
    });
  };

  getWeather = () => {
    const zip = this.state.zipcode;

    if (!this.state.weatherData.some(item => item.zip === zip)) {
      fetch(url + zip + ',us&units=imperial&appid=' + WEATHER_KEY)
        .then(res => res.json())
        .then(data => {
          if (data.main) {
            this.setState(prevState => {
              let newWeatherData = prevState.weatherData;
              newWeatherData.push({
                id: zip,
                zip: zip,
                temp: data.main.temp,
                name: data.names
              });

              localStorage.setItem(
                'weather-data',
                JSON.stringify(newWeatherData)
              );

              return { ...prevState, weatherData: newWeatherData };
            });
            console.log(`${data.name}, ${data.main.temp}˚.`);
          } else {
            alert('No data for that zipcode');
          }
        })
        .catch(err => console.log(err));
    }
  };

  deleteZip = () => {
    this.setState(prevState => {
      let newWeatherData = prevState.weatherData.filter(
        item => item.zip !== this.state.selectedItem
      );
      console.log({ new: newWeatherData });
      localStorage.setItem('weather-data', JSON.stringify(newWeatherData));
      return {
        ...prevState,
        weatherData: newWeatherData
      };
    });
  };

  message = <p id="message">Enter a valid 5-digit zipcode</p>;

  render() {
    return (
      <div className="weather-form-container">
        {((this.state.zipcode.length > 0 && this.state.zipcode.length < 5) ||
          this.state.zipcode.length > 5) &&
          this.message}
        <Input
          zipcode={this.state.zipcode}
          onInputChange={this.handleInputChange}
          clearInput={this.clearInput}
          getWeather={this.getWeather}
          selectedItem={this.state.selectedItem}
          clearSelected={this.clearSelected}
          deleteZip={this.deleteZip}
        />
        <WeatherList
          weatherData={this.state.weatherData}
          setZip={
            this.setZip // onSelect={this.onSelect}
          }
          selectedItem={this.state.selectedItem}
        />
      </div>
    );
  }
}

// const GetWeatherApp = () => {

//   return (
//     <Context.Provider value={weatherData}>
//       <WeatherForm />
//     </Context.Provider>
//   );
// };

const Header = () => {
  return (
    <div className="header">
      <h1>Get Yo Weather</h1>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Header />
      <WeatherForm />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
